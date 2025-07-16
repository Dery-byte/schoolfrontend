import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './pages/layouts/admin-layout/admin-layout.component';
import { UserLayoutComponent } from './pages/layouts/user-layout/user-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminHomeComponent } from './pages/admin/admin-home/admin-home.component';
import { UserHomeComponent } from './pages/user/user-home/user-home.component';
import { HttpClientModule } from '@angular/common/http';
import { AdminHeaderComponent } from './pages/admin/admin-header/admin-header.component';
import { AdminFooterComponent } from './pages/admin/admin-footer/admin-footer.component';
import { AdminSidebarComponent } from './pages/admin/admin-sidebar/admin-sidebar.component';
import { ActivateAccountComponent } from './pages/activate-account/activate-account.component';
import { CodeInputModule } from 'angular-code-input';
import { AddUniversityComponent } from './pages/admin/add-university/add-university.component';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import { AddCoursesComponent } from './pages/admin/add-courses/add-courses.component';
import { AllUniversitiesComponent } from './pages/admin/all-universities/all-universities.component';
import { AllProgramsComponent } from './pages/admin/all-programs/all-programs.component';
import { UserFooterComponent } from './pages/user/user-footer/user-footer.component';
import { UserHeaderComponent } from './pages/user/user-header/user-header.component';
import { UserSidebarComponent } from './pages/user/user-sidebar/user-sidebar.component';
import { UserCheckResultsComponent } from './pages/user/user-check-results/user-check-results.component';
import { UserEligibilityComponent } from './pages/user/user-eligibility/user-eligibility.component';
import { ConfirmationModalComponent } from './pages/utilities/confirmation-modal/confirmation-modal.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';




@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    UserLayoutComponent,
    LoginComponent,
    RegisterComponent,
    AdminHomeComponent,
    UserHomeComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
    AdminSidebarComponent,
    ActivateAccountComponent,
    AddUniversityComponent,
    AddCoursesComponent,
    AllUniversitiesComponent,
    AllProgramsComponent,
    UserFooterComponent,
    UserHeaderComponent,
    UserSidebarComponent,
    UserCheckResultsComponent,
    UserEligibilityComponent,
    ConfirmationModalComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CodeInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    NgbNavModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
