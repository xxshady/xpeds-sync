import * as alt from "alt-client"
import * as native from "natives"
import { InternalPed } from "../../ped/internal"

export class PedNametags {
  private readonly player = alt.Player.local

  private readonly yOffset = 0
  private readonly fontStyle = 0
  private readonly fontSize = 0.35
  private readonly defaultAlpha = 215
  private readonly barsConfig = {
    maxWidth: 0.05,
    height: 0.0065,
    border: 0.001,
    x: 0,
    yOffset: 0.035,
    borderColor: [0, 0, 0, 100],
    hpColor: [80, 171, 80, 185],
    bgColor: [44, 77, 44, 0],
  } as const

  // head bone
  private readonly drawFromBoneId = 12844
  private readonly drawBonePosOffset = 0.5

  private drawRange: number
  private readonly handlers = [this.draw.bind(this)]

  constructor({ drawRange = 15 }: { drawRange?: number }) {
    this.drawRange = drawRange

    alt.everyTick(this.everyTickHandler.bind(this))
  }

  private everyTickHandler(): void {
    for (const ped of InternalPed.streamedIn) {
      const dist = new alt.Vector3(ped.gamePed.pos).distanceTo(this.player.pos)
      if (dist > this.drawRange) continue

      this.drawPedTick(ped, dist)
    }
  }

  private drawPedTick(ped: InternalPed, dist: number): void {
    const pos = {
      ...native.getPedBoneCoords(ped.gamePed.scriptID, this.drawFromBoneId, 0, 0, 0),
    }
    pos.z += this.drawBonePosOffset

    const scale = 1 - (0.8 * dist) / this.drawRange
    // TODO: handle vehicle with vehicle ped sync
    const velocityEntity = ped.gamePed.scriptID
    const velocityVector = native.getEntityVelocity(velocityEntity)
    const frameTime = native.getFrameTime()

    native.setDrawOrigin(
      pos.x + velocityVector.x * frameTime,
      pos.y + velocityVector.y * frameTime,
      pos.z + velocityVector.z * frameTime,
      false,
    )

    for (const handler of this.handlers) {
      handler(
        ped,
        scale,
      )
    }

    native.clearDrawOrigin()
  }

  private draw(ped: InternalPed, scale: number): void {
    const fullName = `${ped.xsyncPed.netOwnered ? "~pl~" : ""}ped~w~ ~b~[${ped.xsyncPed.id}]`
    scale *= this.fontSize

    native.beginTextCommandDisplayText("STRING")
    native.setTextFont(this.fontStyle)
    native.setTextScale(scale, scale)
    native.setTextProportional(true)
    native.setTextCentre(true)
    native.setTextColour(255, 255, 255, this.defaultAlpha)
    native.setTextOutline()
    native.addTextComponentSubstringPlayerName(fullName)
    native.endTextCommandDisplayText(0, this.yOffset, 0)

    this.drawBars(ped, scale)
  }

  private drawBars(ped: InternalPed, scale: number): void {
    const {
      maxWidth,
      height,
      border,
      hpColor,
      bgColor,
      x,
      yOffset,
      borderColor,
    } = this.barsConfig

    let {
      health,
    } = ped.gamePed

    health -= 100
    if (health < 0) health = 0
    else if (health > 100) health = 100

    const y = yOffset * scale * 2.5
    const width = maxWidth / 100

    this.drawRect(x, y, maxWidth + border * 2, height + border * 2, ...borderColor)
    this.drawRect(x, y, maxWidth, height, ...bgColor)
    this.drawRect(
      (x - width / 2 * (1 - health)) - (maxWidth / 2),
      y,
      width * health,
      height,
      ...hpColor,
    )
  }

  private drawRect(x: number, y: number, width: number, height: number, r: number, g: number, b: number, a: number): void {
    native.drawRect(x, y, width, height, r, g, b, a, false)
  }
}
