import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from '../login/login.component';
import { ChatComponent } from '../chat/chat.component';

export const routes: Routes = [
    {path: 'login', component:LoginComponent},
    {path: 'chat', component:ChatComponent},
    {path: '', redirectTo:'login',pathMatch:'full'}
];
