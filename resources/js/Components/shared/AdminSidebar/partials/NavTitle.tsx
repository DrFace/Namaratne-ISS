export default function NavTitle({name}: {name: string;}) {
    return (
        <div className="pl-[20px] uppercase text-[9px] font-[500] tracking-[0.5px]  text-slate-600 ">
            {name}
        </div>
    );
};
