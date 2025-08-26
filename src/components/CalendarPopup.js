import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export const CalendarPopup = ({ selectedDate, onSelectDate, onClose }) => {
    const [date, setDate] = useState(new Date(`${selectedDate}T00:00:00-04:00`));

    const handleChange = (newDate) => {
        setDate(newDate);
        onSelectDate(newDate);
        onClose();
    };

    return (
        <div className="absolute z-50 bg-white border border-gray-300 rounded shadow-md p-4 top-full right-0 mt-2">
            <Calendar onChange={handleChange} value={date} maxDetail="month" minDetail="month" />

            <div className="mt-4 flex justify-between items-center">
                {/* Year Selector */}
                <select value={date.getFullYear()} onChange={(e) => setDate(new Date(Number(e.target.value), date.getMonth(), date.getDate()))} className="border px-2 py-1 rounded">
                    {[...Array(5)].map((_,i) => {
                        const year = new Date().getFullYear() - 3 + i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>

                {/* Today Button */}
                <button onClick={() => {
                    const today = new Date();
                    setDate(today);
                    onSelectDate(today);
                    onClose();
                }}
                className="text-blue-600 hover:underline text-sm">
                    Today
                </button>
            </div>
        </div>
    );
}