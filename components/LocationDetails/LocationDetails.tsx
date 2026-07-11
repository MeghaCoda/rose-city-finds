import type { LocationWithOffers } from "@/schemas/zodSchema";

interface LocationDetailsProps {
    item: LocationWithOffers
}

const LocationDetails = ({ item }: LocationDetailsProps) => {
    return (
        <div className="Location-wrapper">
            <p>{item.business.name}</p>
            {item.business.description && <p>{item.business.description}</p>}
            <p>{item.address}</p>
            {item.address2 && <p>{item.address2}</p>}
            <p>{`${item.city}, ${item.state} ${item.zip_code}`}</p>
            {item.phone_number && <p>Phone Number: {item.phone_number}</p>}
            {item.neighborhood && <p>Neighborhood: {item.neighborhood}</p>}
            {item.verification_status && <p>Verification Status: {item.verification_status}</p>}
            {item.offers.length > 0 && (
                <ul>
                    {item.offers.map((offer) => (
                        <li key={offer.id}>
                            {offer.name}
                            {offer.description && ` — ${offer.description}`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default LocationDetails;
