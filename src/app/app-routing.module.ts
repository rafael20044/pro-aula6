import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

const routes: Routes = [
  // Bienvenida (pública)
  {
    path: 'welcome',
    loadChildren: () => import('./pages/user/welcome/welcome.module').then(m => m.WelcomePageModule)
  },

  // Auth (público)
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadChildren: () => import('./pages/user/auth/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('./pages/user/auth/register/register.module').then(m => m.RegisterPageModule)
      }
    ]
  },

  // Home de usuario (privado)
  {
    path: 'home',
    loadChildren: () => import('./pages/user/home/home.module').then(m => m.HomePageModule),
    // canActivate: [AuthGuard]
  },

  // Área Admin (privado) - lazy load del FEATURE admin
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin-module').then(m => m.AdminModule),
    // canActivate: [AuthGuard]
  },

  // Default: a login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Fallback
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
