import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { RouteReuseStrategy } from '@angular/router';
import { AdminModule } from './pages/admin/admin.module';
import { SharedModule } from './shared/shared-module';
import { AuthService } from './shared/services/auth-service';

function initAuth(auth: AuthService) {
  return () => auth.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, CoreModule, AdminModule, SharedModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
