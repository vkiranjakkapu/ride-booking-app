import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import RideHistoryComponent from "./RideHistoryComponent";

export default function HistoryPage() {
    return (
        <SectionLayoutComponent>
            <div className="space-y-3">
                <RideHistoryComponent />
                <RideHistoryComponent />
                <RideHistoryComponent />
            </div>
        </SectionLayoutComponent>
    );
}
