import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <main class="min-h-screen bg-gray-100">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {}
