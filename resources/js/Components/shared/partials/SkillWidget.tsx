export default function SkillWidget(
    {
        skills,
        title = "Skills and Expertise"
    }: {

        skills: string[];
        title: string;
    }
) {
    return (
        <div className="space-y-5 text-black ">
            <h2 className="text-xl font-semibold text-start font-Inter ">{title}</h2>
            <div className="flex flex-wrap gap-3">
                {skills?.length > 0 ? (
                    skills?.map((skill: string, index: number) => (
                        <p
                            key={index}
                            className="flex-shrink-0 px-5 py-2 text-sm font-medium capitalize bg-gray-300 text-textSecondary rounded-3xl text-start font-Inter"
                        >
                            {skill}
                        </p>
                    ))
                ) : (
                    <div className="flex items-center justify-center w-full py-2">
                        <p className="text-base font-normal text-gray-400 text-start font-Inter">No skills available</p>
                    </div>
                )}
            </div>

        </div>
    );
}
