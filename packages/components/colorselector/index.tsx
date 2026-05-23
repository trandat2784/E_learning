import {useState} from "react";
import {Controller} from "react-hook-form";
import {Plus} from "lucide-react";

const defaultColor = [
    "#000000", // black
    "#ffffff", // white
    "#ff0000", // red
    "#00ff00", // green
    "#0000ff", // blue
    "#ffff00", // yellow
    "#00ffff", // cyan
    "#ff00ff", // magenta
    "#808080", // gray
    "#c0c0c0", // silver
    "#800000", // maroon
    "#808000", // olive
    "#008000", // dark green
    "#800080", // purple
    "#008080", // teal
    "#000080", // navy
];
const ColorSelector = ({control, erros}: any) => {
    const [customColors, setCustomColors] = useState<string[]>([])
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [newColor, setNewColor] = useState("#000000")
    return (
        <div className="mt-2">
            <label htmlFor="" className="block font-semibold text-gray-300 mb-1"> Colors</label>
            <Controller name="colorselector" control={control} render={({field}) =>
                (<div className={"flex gap-3 flex-wrap"}>
                    {[...defaultColor, ...customColors].map((color) => {
                        const isSelected = (field.value || []).includes(color)
                        const isLightColor = ["fff", "#ffff00"].includes(color)
                        return (<button type={"button"} key={color}
                                        onClick={() => field.onChange(isSelected ?
                                            field.value.filter((c: string) => c != color) :
                                            [...(field.value || []), color])}
                                        className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${isSelected ? "scale-110 border-white" : "border-t-transparent"} ${isLightColor ? "border-gray-600" : ""}`}
                                        style={{backgroundColor: color}}
                            />
                        )
                    })}
                    {/*    add new color */}
                    <button type={"button"}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={"w-8 h-8 flex items-center justify-center border-2 rounded-full border-gray-500 bg-gray-800 hover:bg-gray-700 transition"}>
                        <Plus size={16} color={"white"}/>
                    </button>
                    {/*    Color picker*/}
                    {showColorPicker && (<div className={"relative flex items-center gap-2"}>
                        <input type="color" value={newColor}
                               onChange={(e) => setNewColor(e.target.value)}
                               className={"w-10 h-10 p-0 border-none cursor-pointer"}

                        />
                        <button type={"button"}
                                onClick={() => {
                                    setCustomColors([...customColors, newColor])
                                    setShowColorPicker(false)
                                }}
                                className={"px-3 py-1 bg-gray-700 text-white rounded-md text-sm"}
                        >
                            ADD
                        </button>
                    </div>)}


                </div>)}/>

        </div>
    )
}
export default ColorSelector