export const MiniNewsCard = ({ id, title, image, isActive, onClick, refEl}) => {
    return (
        <div ref={refEl} onClick={() => onClick(id)} className={`flex flex-col items-center gap-2 p-2 cursor-pointer rounded transition ${isActive ? "bg-blue-400" : "bg-white hover:bg-gray-100"}`}>
            <img src={image} alt={title} className="w-24 h-20 object-cover rounded" />
            <p className="text-base font-medium mt-2 leading-tight">{title}</p>
        </div>
    );
}