import type { Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/landing/landing.component").then((m) => m.LandingComponent),
  },
  {
    path: "chat",
    loadComponent: () => import("./pages/chat/chat.component").then((m) => m.ChatComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
]
