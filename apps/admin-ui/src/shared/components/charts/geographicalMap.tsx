"use client"
import {ComposableMap, Geographies, Geography} from "react-simple-maps"
import {AnimatePresence, motion} from "framer-motion"
import {useState} from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const countryData = [
    {name: "United States of America", users: 120, professors: 30},
    {name: "India", users: 10, professors: 30},
    {name: "Germany", users: 10, professors: 3},

]
const getColor = (countryName: string) => {
    const country = countryData.find((c) => c.name == countryName)
    if (!country) return "#1e293b"
    const total = country.users + country.professors
    if (total > 100) return "#22c55e"
    if (total > 0) return "#3b82f6"
    return "#1e293b"
}
const GeographicalMap = () => {
    const [hovered, setHovered] = useState<{ name: string, users: number, professors: number } | null>(null)
    const [tooltipPosition, setTooltipPosition] = useState({x: 0, y: 0})
    return (
        <div>
            <ComposableMap
                projection={"geoEqualEarth"}
                projectionConfig={{scale: 230, center: [0, 10]}}
                width={1400}
                height={500}
                viewBox={"0 0 1400 500"}
                preserveAspectRatio={"xMidyMid slice"}
                style={{
                    width: "100%",
                    height: "35vh",
                    background: "transparent",
                    margin: 0,
                    padding: 0,
                    display: 'block',

                }}
            >

                <Geographies geography={geoUrl}>
                    {
                        ({geographies}) => {
                            geographies.map((geo) => {
                                const countryName = geo.properties.name
                                const match = countryData.find((c) => c.name == countryName)
                                const baseColor = getColor(countryName)
                                return (
                                    <Geography
                                        key={geo.rsmkey}
                                        geography={geo}
                                        onMouseEnter={(e) => {
                                            setTooltipPosition({x: e.pageX, y: e.pageY})
                                            setHovered({
                                                name: countryName,
                                                users: match?.users || 0,
                                                professors: match?.professors || 0,
                                            })
                                        }}
                                        onMouseMove={(e) => {
                                            setTooltipPosition({x: e.pageX, y: e.pageY})
                                        }}
                                        onMouseLeave={() => setHovered(null)}
                                        fill={baseColor}
                                        stroke={"#334155"}
                                        style={{
                                            default: {
                                                outline: "none",
                                                transition: "fill 0.3s ease-in-out",
                                            },
                                            hover: {fill: match ? baseColor : "#facc15"},
                                            pressed: {fill: "#ef4444", outline: "none"},
                                        }}

                                    />
                                )
                            })
                        }
                    }
                </Geographies>
            </ComposableMap>
            {/*    Tooltip with animation*/}
            <AnimatePresence>
                {
                    hovered && (
                        <motion.div
                            key={hovered.name}
                            initial={{opacity: 0, scale: 0.95}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.95}}
                            transition={{duration: 0.15, ease: "easeOut"}}
                            className={"fixed bg-gray-800 text-white text-xs p-2 !rounded shadow-lg"}
                            style={{
                                top: tooltipPosition.y,
                                left: tooltipPosition.x,
                            }}
                        >
                            <strong>{hovered.name}</strong>
                            <br/>
                            Users:<span className={"text-green-400"}>{hovered.users}</span>
                            <br/>
                            Professors:<span className={"text-yellow-400"}>{hovered.professors}</span>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    )
}
export default GeographicalMap;