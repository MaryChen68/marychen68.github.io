// Synthesized ambience: a soft low pad, filtered noise for wind or waves,
// and an occasional quiet chime. No recorded audio.
import type { ThemeId } from './themes'

const noiseSettings: Record<
  ThemeId,
  { cutoff: number; swell: number; rate: number }
> = {
  forest: { cutoff: 700, swell: 0.25, rate: 0.08 },
  desert: { cutoff: 1400, swell: 0.35, rate: 0.05 },
  ocean: { cutoff: 500, swell: 0.8, rate: 0.12 },
}

export class Ambience {
  enabled = false
  private context?: AudioContext
  private master?: GainNode
  private filter?: BiquadFilterNode
  private lfoGain?: GainNode
  private lfo?: OscillatorNode
  private sources: AudioScheduledSourceNode[] = []
  private timer?: number
  private theme: ThemeId = 'forest'

  async start() {
    this.context ??= new AudioContext()
    const c = this.context
    await c.resume()
    this.enabled = true

    this.master = c.createGain()
    this.master.gain.setValueAtTime(0, c.currentTime)
    this.master.gain.linearRampToValueAtTime(0.16, c.currentTime + 1.5)
    this.master.connect(c.destination)

    // Low pad: a quiet open fifth
    for (const [i, f] of [110, 164.81, 220].entries()) {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.frequency.value = f
      gain.gain.value = 0.05 / (i + 1)
      osc.connect(gain).connect(this.master)
      osc.start()
      this.sources.push(osc)
    }

    // Wind / waves: looping noise through a low-pass filter, swelling slowly
    const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = c.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    this.filter = c.createBiquadFilter()
    this.filter.type = 'lowpass'
    const noiseGain = c.createGain()
    noiseGain.gain.value = 0.35
    this.lfo = c.createOscillator()
    this.lfoGain = c.createGain()
    this.lfo.connect(this.lfoGain).connect(noiseGain.gain)
    noise.connect(this.filter).connect(noiseGain).connect(this.master)
    noise.start()
    this.lfo.start()
    this.sources.push(noise, this.lfo)
    this.setTheme(this.theme)

    this.timer = window.setInterval(() => this.chime(), 7000)
  }

  stop() {
    const c = this.context
    if (!c || !this.master) return
    this.enabled = false
    clearInterval(this.timer)
    this.master.gain.setTargetAtTime(0, c.currentTime, 0.15)
    const sources = this.sources
    const master = this.master
    this.sources = []
    setTimeout(() => {
      sources.forEach((s) => s.stop())
      master.disconnect()
    }, 800)
  }

  setTheme(id: ThemeId) {
    this.theme = id
    if (!this.context || !this.filter || !this.lfo || !this.lfoGain) return
    const s = noiseSettings[id]
    const now = this.context.currentTime
    this.filter.frequency.setTargetAtTime(s.cutoff, now, 0.5)
    this.lfo.frequency.setTargetAtTime(s.rate, now, 0.5)
    this.lfoGain.gain.setTargetAtTime(s.swell * 0.35, now, 0.5)
  }

  private chime() {
    const c = this.context
    if (!c || !this.master || !this.enabled || document.hidden) return
    const t = c.currentTime
    const f = [392, 440, 523.25, 587.33][Math.floor(Math.random() * 4)]
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.frequency.value = f
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.05, t + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5)
    osc.connect(gain).connect(this.master)
    osc.start(t)
    osc.stop(t + 3.6)
  }
}
