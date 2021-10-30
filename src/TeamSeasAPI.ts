import fetch from "node-fetch";

type Donation = {
    created_at: number;
    ff: number;
    flair: string;
    message_public: string;
    name: string;
    pounds: string;
    pounds_color: string;
    team_name: string;
}

type Team = {
    id: string;
    text: string;
}

type TeamAlpha = {
    sort_donation: string;
    team: string;
    total_donation: string;
    total_members: string;
}

type DonationsResponse = {
    config: {};
    most: Donation[];
    recent: Donation[];
    teams: Team[];
    teams_alpha: TeamAlpha[];
    teams_most_donations: TeamAlpha[];
}


export default class TeamSeasAPI {
    private static BASE_URL = "https://tscache.com/";
    private static donationsCache: DonationsResponse;

    public static async getTotalDonations(): Promise<number> {
        const data = await TeamSeasAPI.getData("donation_total.json");
        return Number(data.count);
    }

    public static async getTopDonations(forceUpdate?: boolean): Promise<any> {
        await TeamSeasAPI.getDonations(forceUpdate);
        return this.donationsCache.most;
    }

    public static async getRecentDonations(forceUpdate?: boolean): Promise<any> {
        await TeamSeasAPI.getDonations(forceUpdate);
        return this.donationsCache.recent;
    }

    private static async getDonations(forceUpdate: boolean = false): Promise<void> {
        if (forceUpdate || !TeamSeasAPI.donationsCache) {
            TeamSeasAPI.donationsCache = await TeamSeasAPI.getData("lb_recent.json");
        }
    }

    private static async getData(endpoint: string): Promise<any> {
        const res = await fetch(`${TeamSeasAPI.BASE_URL}/${endpoint}`);
        const data = await res.json();
        return data;
    }
}