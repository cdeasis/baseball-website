export const FeedbackBox = () => {
    return (
        <div className="w-[300px] bg-white p-4 rounded shadow space-y-3">
            <h2 className="text-lg font-semibold">Feedback and Contact</h2>
            <p className="text-sm">Thanks for visting! Feel free to get in contact or provide some feedback regarding your thoughts on the page!</p>
            <input type="text" placeholder="Name" className="w-full border p-2 rounded text-sm" />
            <input type="email" placeholder="Email" className="w-full border p-2 rounded text-sm" />
            <textarea placeholder="Your message (optional)" rows={5} className="w-full border p-2 rounded text-sm" />
            <button disabled className="bg-gray-300 text-white p-2 rounded text-sm w-full cursor-not-allowed">Submit (coming soonn)</button>
        </div>
    );
}