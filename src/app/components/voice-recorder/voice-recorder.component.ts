import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-voice-recorder",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-16 left-0 right-0 bg-red-50 p-3 flex justify-between items-center border-t border-gray-300 shadow-lg">
      <div class="flex items-center">
        <span class="animate-pulse mr-2 text-red-500">●</span>
        <span class="text-gray-700">Recording... {{ recordingTime }}s</span>
      </div>
      <div class="flex space-x-2">
        <button 
          (click)="cancelRecording.emit()" 
          class="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button 
          (click)="sendRecording.emit()" 
          class="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
    }
  `,
  ],
})
export class VoiceRecorderComponent {
  @Input() recordingTime = 0
  @Output() cancelRecording = new EventEmitter<void>()
  @Output() sendRecording = new EventEmitter<void>()
}
