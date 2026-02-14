// Demo audio generator for creating placeholder songs
export class DemoAudioGenerator {
  private audioContext: AudioContext;
  private duration: number = 30; // 30 second demos

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  // Generate a simple musical phrase for each configured song
  private getSongPattern(songId: string): { notes: number[], tempo: number } {
    const patterns = {
      gravity: { 
        notes: [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66], // C-D-E-F-G-F-E-D
        tempo: 0.5 
      },
      vivid_dreams: { 
        notes: [392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00], // G-A-B-C-B-A-G
        tempo: 0.6 
      },
      hereditary: { 
        notes: [220.00, 246.94, 261.63, 293.66, 261.63, 246.94, 220.00], // A-B-C-D-C-B-A
        tempo: 0.4 
      },
      being_so_normal: { 
        notes: [329.63, 369.99, 415.30, 440.00, 415.30, 369.99, 329.63], // E-F#-G#-A-G#-F#-E
        tempo: 0.45 
      },
      fallen: { 
        notes: [293.66, 329.63, 369.99, 392.00, 369.99, 329.63, 293.66], // D-E-F#-G-F#-E-D
        tempo: 0.55 
      }
    };

    return patterns[songId as keyof typeof patterns] || patterns.gravity;
  }

  async generateDemoSong(songId: string): Promise<Blob> {
    const { notes, tempo } = this.getSongPattern(songId);
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, this.duration * sampleRate, sampleRate);
    
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    // Generate the melody
    for (let i = 0; i < buffer.length; i++) {
      const time = i / sampleRate;
      const noteIndex = Math.floor(time / tempo) % notes.length;
      const frequency = notes[noteIndex];
      
      // Create a simple sine wave with envelope
      const envelope = Math.max(0, 1 - (time % tempo) / tempo) * 0.3;
      const sample = Math.sin(2 * Math.PI * frequency * time) * envelope;
      
      leftChannel[i] = sample;
      rightChannel[i] = sample;
    }

    // Convert to WAV format
    return this.bufferToWav(buffer);
  }

  private bufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  static async createDemoFiles(): Promise<{ [key: string]: string }> {
    const generator = new DemoAudioGenerator();
    const songs = ["gravity", "vivid_dreams", "hereditary", "being_so_normal", "fallen"];
    const urls: { [key: string]: string } = {};

    for (const songId of songs) {
      try {
        const audioBlob = await generator.generateDemoSong(songId);
        urls[songId] = URL.createObjectURL(audioBlob);
      } catch (error: any) {
        void error;
      }
    }

    return urls;
  }
}
