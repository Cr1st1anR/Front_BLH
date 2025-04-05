import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import DashboardComponent from '../../shared/components/dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    DashboardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
