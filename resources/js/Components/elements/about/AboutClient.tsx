import { usePage } from "@inertiajs/react";
import { Rating } from "react-simple-star-rating";
import { fillColorArray } from "@/lib/fillColorArray";
import { formatNumber } from "@/lib/utility";

const AboutClient = (
    {
        user,
    }: {
        user: any;
    }) => {

    return (
        <div className="flex flex-col gap-3 py-8">
            <h2 className="text-xl font-semibold text-start font-Inter ">About the client</h2>
            <div className="flex flex-col gap-1">
                {user?.id_verified &&
                    <div className="flex flex-row gap-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#28A745" />
                        </svg>

                        <p className="text-xs font-medium text-textSecondary text-start font-Inter ">ID verified</p>
                    </div>
                }
                {user?.payment_verified &&
                    <div className="flex flex-row gap-1">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.00264 1.50049C4.41779 1.50049 1.50122 4.41706 1.50122 8.0019C1.50122 11.5867 4.41779 14.5033 8.00264 14.5033C11.5875 14.5033 14.5041 11.5867 14.5041 8.0019C14.5041 4.41706 11.5875 1.50049 8.00264 1.50049ZM11.3862 5.82299L7.18527 10.8241C7.13919 10.879 7.08185 10.9233 7.01714 10.9541C6.95242 10.9849 6.88185 11.0014 6.81019 11.0026H6.80175C6.73165 11.0025 6.66234 10.9878 6.59832 10.9592C6.53429 10.9307 6.47698 10.889 6.43011 10.8369L4.62971 8.83646C4.58399 8.78797 4.54842 8.73082 4.5251 8.66838C4.50178 8.60594 4.49117 8.53947 4.49391 8.47288C4.49664 8.40628 4.51266 8.3409 4.54102 8.28058C4.56938 8.22027 4.60951 8.16623 4.65906 8.12164C4.7086 8.07706 4.76656 8.04282 4.82952 8.02096C4.89248 7.99909 4.95918 7.99003 5.0257 7.99431C5.09221 7.99859 5.1572 8.01612 5.21684 8.04587C5.27648 8.07562 5.32958 8.117 5.373 8.16757L6.78862 9.74041L10.6204 5.17973C10.7063 5.08036 10.8279 5.0188 10.9589 5.00836C11.0899 4.99793 11.2197 5.03945 11.3203 5.12395C11.4209 5.20846 11.4842 5.32916 11.4965 5.45997C11.5089 5.59078 11.4692 5.72118 11.3862 5.82299Z" fill="#004AAD" />
                        </svg>
                        <p className="text-xs font-medium text-textSecondary text-start font-Inter ">Payment verified</p>
                    </div>
                }

                <div className="flex flex-row items-center justify-start gap-1 ">
                    <Rating
                        initialValue={user?.rating}
                        readonly
                        transition
                        allowFraction
                        //showTooltip
                        //tooltipArray={tooltipArray}
                        fillColorArray={fillColorArray}
                        iconsCount={5}
                        size={20}
                        emptyStyle={{ display: "flex" }}
                        fillStyle={{
                            display: "-webkit-inline-box",
                        }}
                    />
                    <span className="mt-1.5 text-xs font-medium text-textSecondary text-start font-Inter ">
                        {parseFloat(user?.rating).toFixed(1)}
                    </span>
                </div>
                <div>
                    <p className="text-xs font-medium text-textSecondary text-start font-Inter "> {parseFloat(user?.rating).toFixed(1)} of {user?.review_count} reviews</p>
                </div>

            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-textSecondary text-start font-Inter ">{user?.country}</p>
                <p className="text-xs font-normal text-textSecondary text-start font-Inter ">{user?.user_country_time}</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-textSecondary text-start font-Inter ">{user?.active_job_count} jobs posted</p>
                <p className="text-xs font-normal text-textSecondary text-start font-Inter ">{(user?.hire_rate)?.toFixed(1)} % hire rate</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-textSecondary text-start font-Inter ">{formatNumber(user?.total_spent)} total spent</p>
                <p className="text-xs font-normal text-textSecondary text-start font-Inter ">{user?.active_offer_count} hires</p>
            </div>
            <div className="flex flex-row gap-1">
                <p className="text-xs font-normal text-textSecondary text-start font-Inter ">Member since {user?.created_at_human}</p>
            </div>

        </div>

    );
};

export default AboutClient;
