import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from 'src/app/core/guards/admin-guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home-admin/home-admin.module').then(m => m.HomeAdminPageModule),
    // canActivate: [AdminGuard]  
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
