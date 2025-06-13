import { Component } from '@angular/core';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';

@Component({
  selector: 'app-user-eligibility',
  templateUrl: './user-eligibility.component.html',
  styleUrls: ['./user-eligibility.component.css']
})
export class UserEligibilityComponent {



  constructor(  private manualService: ManaulServiceService,){
        
  }

    ngOnInit(): void {

      this.recordByUser();
  }

  records:any;


  recordByUser(){
  this.manualService.eligibilityRecordsByUser().subscribe({
    next: (data: any) => {
      this.records = data;

    },
    error: (err) => {
      console.error('Fetching Records!!!:', err);
    }
  });
  }
}
