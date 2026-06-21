import type { PhysicalLocation } from "@/schemas/zodSchema";

interface LocationDetailsProps {
    item: PhysicalLocation
}

const LocationDetails = ({ item }: LocationDetailsProps) => {
    return (
        <div className="Location-wrapper">
            <p>{item.address}</p>
            {item.address2 && <p>{item.address2}</p>}
            <p>{`${item.city}, ${item.state} ${item.zip_code}`}</p>
            {item.phone_number && <p>Phone Number: {item.phone_number}</p>}
            {item.neighborhood && <p>Neighborhood: {item.neighborhood}</p>}
            {item.verification_status && <p>Verification Status: {item.verification_status}</p>}
        </div>
    )
}

export default LocationDetails;
