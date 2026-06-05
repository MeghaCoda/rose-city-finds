"use client"
import { useState } from "react";
import LocationMap from "@/components/LocationMap/LocationMap";
import mockData from "@/__mocks__/mockData";
import type { Location } from "@/schemas/zodSchema";
import LocationDetails from "../LocationDetails/LocationDetails";

const Map = () => {
    const [selectedItem, setSelectedItem] = useState<Location | undefined>()

    return (
        <>
            <h2>Food Map</h2>
            <div style={{display: 'flex', flexDirection: 'row'}}>
            <LocationMap
                onSelect={(item: Location) => setSelectedItem(item)}
                data={mockData}
            />
            {selectedItem &&
                <LocationDetails item={selectedItem} />
            }
            </div>
        </>
    )
}

export default Map;