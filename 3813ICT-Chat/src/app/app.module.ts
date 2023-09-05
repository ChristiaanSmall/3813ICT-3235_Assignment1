import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupChannelsComponent } from './group-channels/group-channels.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatWindowComponent,
    DashboardComponent,
    GroupChannelsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
