import { useEffect, useRef, useCallback } from 'react'

const TOKENS = ['{}', '=>', 'null', ';', '[]', '&&', '!==', 'void', 'NaN', '??', 'undefined', '/**/']
const CANVAS_H = 185
const GROUND = 148
const PLAYER_X = 65
const GRAV = 0.52
const JUMP = -10.5

type GS = 'idle' | 'playing' | 'dead'

interface Obs { x: number; text: string; w: number }

interface GameData {
  state: GS
  py: number
  vy: number
  floor: boolean
  obs: Obs[]
  score: number
  speed: number
  frame: number
}

const TerminalGame = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const g = useRef<GameData>({
    state: 'idle', py: GROUND, vy: 0, floor: true,
    obs: [], score: 0, speed: 3.5, frame: 0,
  })

  const act = useCallback(() => {
    const d = g.current
    if (d.state !== 'playing') {
      Object.assign(d, {
        state: 'playing', py: GROUND, vy: 0, floor: true,
        obs: [], score: 0, speed: 3.5, frame: 0,
      })
    } else if (d.floor) {
      d.vy = JUMP
      d.floor = false
    }
  }, [])

  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!

    const setW = () => { c.width = c.offsetWidth || window.innerWidth }
    setW()
    const ro = new ResizeObserver(setW)
    ro.observe(c)

    let raf: number

    const loop = () => {
      const d = g.current
      const W = c.width

      if (d.state === 'playing') {
        d.frame++
        d.vy += GRAV
        d.py += d.vy
        if (d.py >= GROUND) { d.py = GROUND; d.vy = 0; d.floor = true }

        d.speed = 3.5 + Math.floor(d.frame / 250) * 0.35

        const gap = Math.max(52, 95 - Math.floor(d.frame / 200) * 5)
        if (d.frame % gap === 0) {
          const tok = TOKENS[Math.floor(Math.random() * TOKENS.length)]
          ctx.font = '12px "Space Mono",monospace'
          d.obs.push({ x: W + 10, text: tok, w: ctx.measureText(tok).width })
        }

        d.obs = d.obs.map(o => ({ ...o, x: o.x - d.speed })).filter(o => o.x > -80)

        const [px1, py1, px2, py2] = [PLAYER_X - 6, d.py - 12, PLAYER_X + 18, d.py + 3]
        for (const ob of d.obs) {
          const [ox1, oy1, ox2, oy2] = [ob.x + 2, GROUND - 12, ob.x + ob.w - 2, GROUND + 3]
          if (px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1) {
            d.state = 'dead'
            break
          }
        }
        d.score++
      }

      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, W, CANVAS_H)

      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 8])
      ctx.beginPath(); ctx.moveTo(0, GROUND + 16); ctx.lineTo(W, GROUND + 16); ctx.stroke()
      ctx.setLineDash([])

      const blink = Math.floor(Date.now() / 430) % 2 === 0
      ctx.font = 'bold 13px "Space Mono",monospace'
      ctx.fillStyle = d.state === 'dead' ? '#ef4444' : '#4ade80'

      if (d.state === 'idle') {
        ctx.fillText('>', PLAYER_X - 6, GROUND + 2)
        if (blink) ctx.fillText('_', PLAYER_X + 6, GROUND + 2)
      } else {
        ctx.fillText('>_', PLAYER_X - 6, d.py + 2)
      }

      ctx.font = '12px "Space Mono",monospace'
      ctx.fillStyle = '#ef4444'
      for (const ob of d.obs) ctx.fillText(ob.text, ob.x, GROUND + 2)

      if (d.state === 'playing') {
        ctx.font = '10px "Space Mono",monospace'
        ctx.fillStyle = '#252525'
        ctx.textAlign = 'right'
        ctx.fillText(String(d.score).padStart(6, '0'), W - 12, 16)
        ctx.textAlign = 'left'
      }

      if (d.state === 'idle') {
        ctx.font = '11px "Space Mono",monospace'
        ctx.fillStyle = '#222'
        ctx.textAlign = 'center'
        ctx.fillText('space · tap to play', W / 2, CANVAS_H / 2 + 8)
        ctx.textAlign = 'left'
      }

      if (d.state === 'dead') {
        ctx.fillStyle = 'rgba(8,8,8,0.88)'
        ctx.fillRect(0, 55, W, 80)
        ctx.font = 'bold 11px "Space Mono",monospace'
        ctx.fillStyle = '#ef4444'
        ctx.textAlign = 'center'
        ctx.fillText('// segfault', W / 2, 90)
        ctx.font = '10px "Space Mono",monospace'
        ctx.fillStyle = '#333'
        ctx.fillText(`score: ${d.score}  ·  space or tap to retry`, W / 2, 110)
        ctx.textAlign = 'left'
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); act() }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      ro.disconnect()
    }
  }, [act])

  return (
    <canvas
      ref={ref}
      height={CANVAS_H}
      onClick={act}
      className="terminal-game"
    />
  )
}

export default TerminalGame
