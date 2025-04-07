import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DashBoardComponent } from '../../shared/components/dash-board/dash-board.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    DashBoardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
