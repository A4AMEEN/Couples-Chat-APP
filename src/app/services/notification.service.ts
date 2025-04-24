import { Injectable } from "@angular/core"
import  { SwPush } from "@angular/service-worker"
import  { HttpClient } from "@angular/common/http"
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
  ) {}

  subscribeToNotifications(): Promise<void> {
    return this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((subscription) => {
        return this.http.post(`${environment.apiUrl}/notifications/subscribe`, subscription.toJSON()).toPromise()
      })
      .then(() => console.log("Subscription added successfully"))
      .catch((err) => console.error("Could not subscribe to notifications", err))
  }

  unsubscribeFromNotifications(): Promise<void> {
    return this.swPush
      .unsubscribe()
      .then(() => {
        return this.http.delete(`${environment.apiUrl}/notifications/unsubscribe`).toPromise()
      })
      .then(() => console.log("Unsubscribed from notifications"))
      .catch((err) => console.error("Error unsubscribing from notifications", err))
  }
}
