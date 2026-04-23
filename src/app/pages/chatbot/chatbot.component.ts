import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm Mudita, your university eligibility assistant. Before we begin, may I know your name?"
    }
  ];

  constructor(private manualService: ManaulServiceService) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isTyping) return;

    this.messages.push({ role: 'user', content: text });
    this.userInput = '';
    this.isTyping = true;

    const history = this.messages.slice(0, -1);

    const userTurns = this.messages.filter(m => m.role === 'user').length;
    this.manualService.chatWithMudita(text, history, userTurns).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        this.messages.push({ role: 'assistant', content: res.reply || 'Sorry, no response.' });
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment."
        });
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private readonly CONTACT_HTML = '<div class="chat-contact-icons"><a href="https://wa.me/233202483231" target="_blank" rel="noopener" class="chat-icon-btn chat-whatsapp" title="WhatsApp"><i class="fab fa-whatsapp"></i></a><a href="mailto:optimusinforservice@gmail.com" target="_blank" rel="noopener" class="chat-icon-btn chat-email" title="Email"><i class="fas fa-envelope"></i></a></div>';

  renderMarkdown(text: string): string {
    // Replace [CONTACT_ICONS] token before line-by-line parsing
    text = text.replace(/\[CONTACT_ICONS\]/g, this.CONTACT_HTML);

    const lines = text.split('\n');
    const output: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect markdown table: current line has pipes, next is a separator row (|---|)
      if (/^\|.+\|/.test(line) && lines[i + 1] && /^\|[\s\-:|]+\|/.test(lines[i + 1])) {
        const headers = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map(h => `<th>${h.trim()}</th>`).join('');
        i += 2; // skip header + separator
        const rows: string[] = [];
        while (i < lines.length && /^\|.+\|/.test(lines[i])) {
          const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map(c => `<td>${c.trim()}</td>`).join('');
          rows.push(`<tr>${cells}</tr>`);
          i++;
        }
        output.push(`<table><thead><tr>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
        continue;
      }

      // Bullet list block
      if (/^- /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^- /.test(lines[i])) {
          items.push(`<li>${this.inlineFormat(lines[i].replace(/^- /, ''))}</li>`);
          i++;
        }
        output.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      // Numbered list block
      if (/^\d+\. /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          items.push(`<li>${this.inlineFormat(lines[i].replace(/^\d+\. /, ''))}</li>`);
          i++;
        }
        output.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      // Headings
      if (/^### /.test(line)) { output.push(`<h6>${this.inlineFormat(line.slice(4))}</h6>`); i++; continue; }
      if (/^## /.test(line))  { output.push(`<h5>${this.inlineFormat(line.slice(3))}</h5>`); i++; continue; }
      if (/^# /.test(line))   { output.push(`<h5>${this.inlineFormat(line.slice(2))}</h5>`); i++; continue; }

      // Blank line
      if (line.trim() === '') { output.push('<br>'); i++; continue; }

      // Normal paragraph line
      output.push(`<span>${this.inlineFormat(line)}</span><br>`);
      i++;
    }

    return output.join('');
  }

  private inlineFormat(text: string): string {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
