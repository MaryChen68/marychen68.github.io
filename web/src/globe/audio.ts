// Synthesized ambience: a soft low pad, slow wind, and an occasional quiet chime.
// No recorded audio.

export class Ambience {
  private context?: AudioContext
  private master?: GainNode
  private sources: AudioScheduledSourceNode[] = []
  private timer?: number

  async start() {
    this.context ??= new AudioContext()
    const c = this.context
    await c.resume()

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

    // Wind: looping noise through a low-pass filter, swelling slowly
    const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = c.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600
    const noiseGain = c.createGain()
    noiseGain.gain.value = 0.3
    const lfo = c.createOscillator()
    const lfoGain = c.createGain()
    lfo.frequency.value = 0.08
    lfoGain.gain.value = 0.1
    lfo.connect(lfoGain).connect(noiseGain.gain)
    noise.connect(filter).connect(noiseGain).connect(this.master)
    noise.start()
    lfo.start()
    this.sources.push(noise, lfo)

    this.timer = window.setInterval(() => this.chime(), 7000)
  }

  stop() {
    const c = this.context
    const master = this.master
    if (!c || !master) return
    clearInterval(this.timer)
    master.gain.setTargetAtTime(0, c.currentTime, 0.15)
    const sources = this.sources
    this.sources = []
    this.master = undefined
    setTimeout(() => {
      sources.forEach((s) => s.stop())
      master.disconnect()
    }, 800)
  }

  private chime() {
    const c = this.context
    if (!c || !this.master || document.hidden) return
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.frequency.value = [392, 440, 523.25, 587.33][
      Math.floor(Math.random() * 4)
    ]
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.05, t + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5)
    osc.connect(gain).connect(this.master)
    osc.start(t)
    osc.stop(t + 3.6)
  }
}
