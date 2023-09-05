import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { GroupChannelsComponent } from './group-channels/group-channels.component'; // Import the component

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'chat-window', component: ChatWindowComponent },
  { path: 'group-channels/:groupId', component: GroupChannelsComponent },
  { path: '**', redirectTo: 'login' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
