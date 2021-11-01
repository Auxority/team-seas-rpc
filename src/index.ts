import DiscordRPC from "discord-rpc";
import dotenv from "dotenv";
dotenv.config();

import TeamSeasAPI from "./TeamSeasAPI.js";

const finalGoal = 30000000;
const updateDelay = 15;
const clientId = process.env.CLIENT_ID as string;
const client = new DiscordRPC.Client({ transport: "ipc" });

let presenceIndex = 0;

const formatNumber = (value: number): string => {
    return value.toLocaleString();
}

const formatPercentage = (current: number, goal: number): string => {
    const percentage = Math.max(0, Math.min(100, current / goal * 100));
    return percentage.toFixed(2);
}

const getDefaultPresence = async () => {
    const total = await TeamSeasAPI.getTotalDonations();
    return {
        details: `${formatNumber(total)} / ${formatNumber(finalGoal)} pounds`,
        state: `Progress: ${formatPercentage(total, finalGoal)}%`,
        largeImageKey: "large",
        largeImageText: "",
        smallImageKey: "small",
        smallImageText: "",
		buttons: [
            {
                label: "Donate now",
                url: "https://teamseas.org"
            },
            {
                label: "View github",
                url: "https://github.com/Auxority/team-seas-rpc"
            }
        ],
		instance: false
	}
}

const getTopDonationPresence = async () => {
    const topDonations = await TeamSeasAPI.getTopDonations(true);
    const topDonation = topDonations[0];
    const presence = await getDefaultPresence();

    presence.largeImageText = `Top donation: ${topDonation.pounds} pounds`;
    presence.smallImageText = `by ${topDonation.name}`;

    return presence;
}

const getRecentDonationPresence = async () => {
    const recentDonations = await TeamSeasAPI.getRecentDonations(true);
    const recentDonation = recentDonations[0];
    const presence = await getDefaultPresence();

    presence.largeImageText = `Recent donation: ${recentDonation.pounds} pounds`;
    presence.smallImageText = `by ${recentDonation.name}`;

    return presence;
}

const getCurrentPresence = async (): Promise<any> => {
    const presenceOptions = [
        getTopDonationPresence,
        getRecentDonationPresence
    ];
    presenceIndex = (presenceIndex + 1) % presenceOptions.length;
    return presenceOptions[presenceIndex]();
}

const setActivity = async (): Promise<void> => {
    const presence = await getCurrentPresence();
    client.setActivity(presence);
}

const autoUpdateActivity = async (): Promise<void> => {
    console.log("Updating activity!");
    await setActivity();
    setTimeout(() => {
        autoUpdateActivity();
    }, updateDelay * 1000);
}

client.on("ready", () => {
    console.log("Rich presence active!");
	autoUpdateActivity();
});

client.login({ clientId });