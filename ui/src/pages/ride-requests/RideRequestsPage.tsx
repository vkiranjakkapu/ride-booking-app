import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import RideRequestComponent from "./RideRequestComponent";

export default function RideRequestsPage() {
    return (
        <SectionLayoutComponent
            title="Awaiting Pickup"
            description="Accept the ride to start pickup"
        >
            <div className="space-y-3">
                <RideRequestComponent />
                <RideRequestComponent />
                <RideRequestComponent />
            </div>
        </SectionLayoutComponent>
    );
}
