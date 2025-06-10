import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashBoardComponent } from '../../shared/components/dash-board/dash-board.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    DashBoardComponent,
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(public router: Router) {    
  }

}
