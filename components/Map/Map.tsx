"use client"
import { useState } from "react";
import LocationMap from "@/components/LocationMap";
import mockData from "@/__mocks__/mockData";
import type { Location } from "@/schemas/zodSchema";
import LocationDetails from "../LocationDetails/LocationDetails";
import SearchBar from "../SearchBar/SearchBar";

const Map = () => {
    const [selectedItem, setSelectedItem] = useState<Location | undefined>()

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row flex-1 min-h-0">
                <aside className="w-full md:w-1/4 md:max-w-125 shrink-0 gap-4">
                    <p>This is some left hand column content</p>
                    <SearchBar />
                    {selectedItem && <LocationDetails item={selectedItem} />}
                </aside>

                <div className="flex-1 min-w-0">
                    <LocationMap
                        onSelect={(item: Location) => setSelectedItem(item)}
                        data={mockData}
                    />
                </div>
            </div>
        </>
    )
}

export default Map;