import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  constructor(private titleService: Title, private metaService: Meta) { }

  ngOnInit(): void {
    this.titleService.setTitle('The Future of University Admissions in Ghana | Our Eligibility Checker');
    this.metaService.updateTag({ name: 'description', content: 'Discover why our AI-powered eligibility checker is the most affordable and efficient way to check your university admission status in Ghana. Pay once, check all schools!' });
    this.metaService.updateTag({ name: 'keywords', content: 'WAEC, WASSCE, University Admission Ghana, Eligibility Checker, Ghana Schools, University Results' });
    
    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: 'The Future of University Admissions in Ghana' });
    this.metaService.updateTag({ property: 'og:description', content: 'Instant eligibility reports for all Ghana Universities starting at GHS 10.' });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
  }

}
