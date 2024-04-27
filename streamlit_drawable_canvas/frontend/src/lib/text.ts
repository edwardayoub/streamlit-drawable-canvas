import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class TextTool extends FabricTool {
  isMouseDown: boolean = false
  strokeWidth: number = 10
  textColor: string = "#ffffff"
  currentText: fabric.Textbox = new fabric.Textbox("")
  currentStartX: number = 0
  currentStartY: number = 0
  _minLength: number = 10


  configureCanvas({
                    strokeWidth,
                    strokeColor,
                  }: ConfigureCanvasProps): () => void {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.forEachObject((o) => (o.selectable = o.evented = false))

    this._minLength = strokeWidth

    this.strokeWidth = strokeWidth
    this.textColor = strokeColor

    this._canvas.on("mouse:down", (e: any) => this.onMouseDown(e))
    this._canvas.on("mouse:move", (e: any) => this.onMouseMove(e))
    this._canvas.on("mouse:up", (e: any) => this.onMouseUp(e))
    this._canvas.on("mouse:out", (e: any) => this.onMouseOut(e))
    return () => {
      this._canvas.off("mouse:down")
      this._canvas.off("mouse:move")
      this._canvas.off("mouse:up")
      this._canvas.off("mouse:out")
    }
  }

  onMouseDown(o: any) {
    let canvas = this._canvas
    let _clicked = o.e["button"]
    this.isMouseDown = true
    var pointer = canvas.getPointer(o.e)
    var point = new fabric.Point(pointer.x, pointer.y)
    let objects = canvas.getObjects()


    let textObject = objects.find(obj => {
      return obj instanceof fabric.Textbox && obj.containsPoint(point)
    }) as fabric.Textbox

    if (!textObject) {
      this.currentStartX = pointer.x
      this.currentStartY = pointer.y

      this.currentText = new fabric.Textbox("", {
        left: pointer.x,
        top: pointer.y,
        strokeWidth: this.strokeWidth,
        fill: this.textColor,
        stroke: this.textColor,
        originX: "left",
        originY: "top",
        selectable: true,
        editable: true,
        evented: false,
      })
      if (_clicked === 0) {
        canvas.add(this.currentText)
        canvas.setActiveObject(this.currentText)
        this.currentText.enterEditing()
      }
    } else if (_clicked === 0) {
      // If the text object is clicked, make it the active object
      canvas.setActiveObject(textObject)
      textObject.enterEditing()
    }
  }

  onMouseMove(o: any) {
    if (!this.isMouseDown) return
    let canvas = this._canvas
    let pointer = canvas.getPointer(o.e)
    if (this.currentStartX > pointer.x) {
      this.currentText.set({ left: Math.abs(pointer.x) })
    }
    if (this.currentStartY > pointer.y) {
      this.currentText.set({ top: Math.abs(pointer.y) })
    }
    let _width = Math.abs(this.currentStartX - pointer.x)
    let _height = Math.abs(this.currentStartY - pointer.y)
    this.currentText.set({
      width: Math.max(_width, this._minLength * 2),
      height: Math.max(_height, this._minLength * 2),
    })
    this.currentText.setCoords()
    canvas.renderAll()
  }

  onMouseUp(o: any) {
    this.isMouseDown = false
  }

  onMouseOut(o: any) {
    this.isMouseDown = false
  }
}

export default TextTool
