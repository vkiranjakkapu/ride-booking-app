import DividerComponent from "../../components/DividerComponent";
import RouteComponent from "../../components/RouteComponent";
import { DateFormatter } from "../../utils/DateFormatter";

export default function RideHistoryComponent() {
    return (
        <div className="flex items-center justify-between p-3 gap-3 bg-primary/30 dark:bg-dark-primary rounded">
            <div className="space-y-2">
                <DividerComponent text="Order time" />
                <p>{DateFormatter.toFormattedDate(new Date())}</p>
            </div>
            <RouteComponent className="w-full md:max-w-[46ch]" />
            <div className="space-y-2">
                <DividerComponent text="Ride details" />
                <p>₹ 100 /-</p>
            </div>
        </div>
    );
}
