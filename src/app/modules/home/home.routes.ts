import { Routes } from "@angular/router";
import { HomeComponent } from "./home.component";


export const HOMEROUTES: Routes = [
    {
      path:'',
      component: HomeComponent,
      children:[
        {
            path:'captacion',
            loadChildren: () => import('../captacion/captacion.routes').then((c) => c.CAPTACION_ROUTES)

        }
      ]
    }
  ];