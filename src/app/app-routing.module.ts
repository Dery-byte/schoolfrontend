import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './pages/layouts/admin-layout/admin-layout.component';
import { AdminHomeComponent } from './pages/admin/admin-home/admin-home.component';
import { UserLayoutComponent } from './pages/layouts/user-layout/user-layout.component';
import { UserHomeComponent } from './pages/user/user-home/user-home.component';
import { LoginComponent } from './pages/login/login.component';
import { ActivateAccountComponent } from './pages/activate-account/activate-account.component';
import { activationGuard } from './auth/activation.guard';
import { AddUniversityComponent } from './pages/admin/add-university/add-university.component';
import { AddCoursesComponent } from './pages/admin/add-courses/add-courses.component';
import { AllUniversitiesComponent } from './pages/admin/all-universities/all-universities.component';
import { AllProgramsComponent } from './pages/admin/all-programs/all-programs.component';
import { UserCheckResultsComponent } from './pages/user/user-check-results/user-check-results.component';
import { UserEligibilityComponent } from './pages/user/user-eligibility/user-eligibility.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { RegisterComponent } from './pages/register/register.component';
import { CollegesComponent } from './pages/admin/colleges/colleges.component';
import { LoginSuccessComponent } from './pages/login-success/login-success.component';



const routes: Routes = [
  { path: 'activate-account', component: ActivateAccountComponent, canActivate: [activationGuard] },
  // 🔐 LOGIN ROUTE (default route)
  //  { path: '', component: LoginComponent, pathMatch: 'full' },
  { path: '', component: RegisterComponent, pathMatch: 'full' },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login-success', component: LoginSuccessComponent },
  //  {path:'activate-account', component:ActivateAccountComponent},


  // ADMIN ROUNTING
  {
    path: 'admin',
    component: AdminLayoutComponent,  // 🟢 Admin layout wrapper
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirect `/admin` to `/admin/dashboard`
      { path: 'dashboard', component: AdminHomeComponent }, // Default admin route
      { path: 'addUni', component: AddUniversityComponent },
      { path: 'addPrograms', component: AddCoursesComponent },
      { path: 'universities', component: AllUniversitiesComponent },
      { path: 'programs', component: AllProgramsComponent },
      { path: 'colleges', component: CollegesComponent }

      // {path:'allFarms', component:AllFarmsComponent}
      // {path:'allFarms', component:AllFarmsComponent}

    ],
  },

  {
    path: 'user',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: UserHomeComponent }, // Home wraps everything },
      { path: 'checkResults', component: UserCheckResultsComponent }, // pathMatch: 'full'},
      { path: 'checkEligilibilty', component: UserEligibilityComponent },
      // // {path: 'activate-account',component: ActivateAccountComponent,canActivate: [activationGuard]},
      // // {path: 'shop', component: ExclusiveItemsComponent, },
      // // { path: 'contact', component: ContactComponent, },
      // // {path: 'about', component: AboutComponent,},
      // // {path: 'cart',component: ShoppingChartComponent, canActivate: [cartguardGuard]},
      // // {path: 'blog', component: BlogComponent,},
      // // { path: '**', redirectTo: '' }, // Redirect unknown routes to home
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
