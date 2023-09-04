import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { GroupAdminDashboardComponent } from './group-admin-dashboard/group-admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'group-admin-dashboard', component: GroupAdminDashboardComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'chat-window', component: ChatWindowComponent },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
