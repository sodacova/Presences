const presence = new Presence({
    clientId: "631803867708915732"
  }),
  browsingStamp = Math.floor(Date.now() / 1000);

function getVideoData(element: HTMLElement): [string?, HTMLVideoElement?] {
  if (!element) return [];
  let result = element;

  for (let num = 0; num < 13; num++) result = result.parentElement;

  return [
    (
      result.querySelector("div.n1l5q3vz > span") ??
      result.querySelector("div.i1fnvgqd.j83agx80 div.w0hvl6rk.qjjbsfad > span")
    ).textContent,
    result.querySelector("video")
  ];
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "facebook",
      startTimestamp: browsingStamp
    },
    privacyMode = await presence.getSetting("privacyMode"),
    showTimestamp = await presence.getSetting("timestamp"),
    showSeachQuery = await presence.getSetting("searchQuery"),
    messagerUsername = await presence.getSetting("messagerUsername");

  let dontShowTmp = false;

  if (document.location.pathname.includes("/messages/")) {
    presenceData.largeImageKey = "messenger";

    if (document.location.pathname.includes("/t/")) {
      const username = document
          .querySelector("div.t6p9ggj4.tkr6xdv7")
          .querySelector("span > span")?.textContent,
        hasText = !!document.querySelector('[data-text="true"]')?.textContent;

      if (hasText) {
        if (privacyMode) presenceData.details = "Writing to someone";
        else {
          presenceData.details = "Writing to:";
          presenceData.state = messagerUsername ? username : "(Hidden)";
        }
      } else {
        if (privacyMode) presenceData.details = "Reading messages";
        else {
          presenceData.details = "Reading messages from:";
          presenceData.state = messagerUsername ? username : "(Hidden)";
        }
      }
    } else if (document.location.pathname.includes("/new"))
      presenceData.details = "Composing a new message";
    else if (document.location.pathname.includes("/groupcall/"))
      presenceData.details = "In a group call";
  } else if (document.location.pathname.includes("/videos/")) {
    const video = document.querySelector("video"),
      isLive = !!document.querySelector(
        "div.j83agx80.rgmg9uty.pmk7jnqg.rnx8an3s.fcg2cn6m"
      );

    if (privacyMode)
      presenceData.details = `Watching a ${isLive ? "live" : "video"}`;
    else {
      const username =
        document.querySelector("span.nc684nl6 > span")?.textContent ||
        document.querySelector("span.nc684nl6 > a > strong > span")
          ?.textContent;

      presenceData.details = `Watching a ${isLive ? "live" : "video"} on:`;
      presenceData.state = `${username}'s profile`;

      if (isLive) {
        presenceData.smallImageKey = "live";
        presenceData.smallImageText = "Live";
      } else {
        presenceData.smallImageKey = video.paused ? "pause" : "play";
        presenceData.smallImageText = video.paused ? "Paused" : "Playing";

        if (video.paused) dontShowTmp = true;
        else
          presenceData.endTimestamp = presence
            .getTimestampsfromMedia(video)
            .pop();
      }

      presenceData.buttons = [
        {
          label: `Watch ${isLive ? "live" : "video"}`,
          url: window.location.href
        }
      ];
    }
  } else if (document.location.pathname.includes("/photo/")) {
    if (privacyMode) presenceData.details = "Viewing a photo";
    else {
      const username =
        document.querySelector("span.nc684nl6 > span")?.textContent ||
        document.querySelector("span.nc684nl6 > a > strong > span")
          ?.textContent;

      presenceData.details = "Viewing a photo on:";
      presenceData.state = `${username}'s profile'`;

      presenceData.buttons = [
        {
          label: "View photo",
          url: window.location.href
        }
      ];
    }
  } else if (document.location.pathname.includes("/watch")) {
    const search = new URLSearchParams(location.search).get("q"),
      videoId = new URLSearchParams(location.search).get("v");

    if (!videoId && !search) {
      const videoFrame = Array.from(
        document.querySelectorAll('div[class="l9j0dhe7"]')
      ).find(
        (x) => !x.parentElement.querySelector("video")?.paused
      )?.parentElement;

      if (videoFrame) {
        const video = videoFrame.querySelector("video"),
          user = videoFrame.querySelector(
            "span > span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5"
          )?.textContent,
          description = videoFrame.querySelector("div.n1l5q3vz")?.textContent,
          isLive = !!videoFrame.querySelector(
            "div.j83agx80.rgmg9uty.pmk7jnqg.rnx8an3s.fcg2cn6m"
          );

        if (privacyMode) {
          presenceData.details = `Watch - Watching a ${
            isLive ? "live" : "video"
          }`;
        } else {
          if (isLive) {
            presenceData.details = "Wattch - Watching a live:";
            presenceData.state = description || user;

            presenceData.smallImageKey = "live";
            presenceData.smallImageText = "Live";
          } else {
            presenceData.details = "Watch - Watching a video:";
            presenceData.state = description || user;

            presenceData.smallImageText = "Playing";
            presenceData.smallImageKey = "play";

            presenceData.endTimestamp = presence
              .getTimestampsfromMedia(video)
              .pop();
          }
        }
      } else if (location.pathname.includes("/live")) {
        presenceData.details = "Watch - Watching a live";

        presenceData.smallImageKey = "live";
        presenceData.smallImageText = "Live";
      } else presenceData.details = "Watch - Browsing";
    } else if (videoId) {
      const [title, video] = getVideoData(
        Array.from(document.querySelectorAll("video")).find((x) => !x.paused)
      );

      if (title && !privacyMode) {
        presenceData.details = "Watch - Watching a video:";
        presenceData.state = title;

        presenceData.smallImageText = "Playing";
        presenceData.smallImageKey = "play";

        presenceData.endTimestamp = presence
          .getTimestampsfromMedia(video)
          .pop();
      } else if (title && privacyMode)
        presenceData.details = "Watch - Watching a video";
      else presenceData.details = "Watch - Browsing";
    } else if (search && !privacyMode) {
      presenceData.details = "Watch - Searching for:";
      presenceData.state = showSeachQuery ? decodeURI(search) : "(Hidden)";
    }
  } else if (document.location.pathname.includes("/marketplace/")) {
    presenceData.startTimestamp = browsingStamp;
    if (document.location.pathname.includes("/search/") && !privacyMode) {
      const search = new URLSearchParams(location.search).get("q");
      presenceData.smallImageKey = "search";

      presenceData.details = "Marketplace - Searching for:";
      presenceData.state = showSeachQuery ? decodeURI(search) : "(Hidden)";
    } else if (document.location.pathname.includes("/item/")) {
      if (privacyMode) presenceData.details = "Marketplace - Viewing item";
      else {
        const item = document.querySelector(
          ".dati1w0a.qt6c0cv9.hv4rvrfc.discj3wi span"
        )?.textContent;

        presenceData.details = "Marketplace - Viewing item:";
        presenceData.state = item;
      }
    } else if (document.location.pathname.includes("/groups/"))
      presenceData.details = "Marketplace - Viewing groups";
    else if (document.location.pathname.includes("/stores/"))
      presenceData.details = "Marketplace - Viewing stores";
    else if (document.location.pathname.includes("/buying/"))
      presenceData.details = "Marketplace - Viewing buying";
    else if (document.location.pathname.includes("/selling/"))
      presenceData.details = "Marketplace - Viewing selling";
    else if (document.location.pathname.includes("/saved/"))
      presenceData.details = "Marketplace - Viewing saved";
    else presenceData.details = "Marketplace - Browsing";
  } else if (document.location.pathname.includes("/groups/")) {
    switch (location.pathname.split("/")[2]) {
      case "discover":
        presenceData.details = "Groups - Discover";
        break;
      case "feed":
        presenceData.details = "Groups - Feed";
        break;
      case "notifications":
        presenceData.details = "Groups - Notifications";
        break;
      default: {
        const groupName = document.querySelector(
          "div:nth-child(1) > div div:nth-child(1) > h1 > span > div"
        )?.textContent;

        if (groupName && !privacyMode) {
          presenceData.details = "Viewing group:";
          presenceData.state = groupName;
        } else presenceData.details = "Groups";
      }
    }
  } else if (document.location.pathname.includes("/friends")) {
    presenceData.details = "Friends";

    if (document.location.pathname.includes("/friends/requests")) {
      if (
        document.querySelector(
          "div.cjfnh4rs.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t"
        )
      )
        presenceData.state = "Sent requests";
      else presenceData.state = "Requests";
    } else if (document.location.pathname.includes("/friends/suggestions"))
      presenceData.state = "Suggestions";
    else if (document.location.pathname.includes("/friends/list"))
      presenceData.state = "All friends";
    else if (document.location.pathname.includes("/friends/birthdays"))
      presenceData.state = "Birthdays";
    else if (document.location.pathname.includes("/friends/friendlist"))
      presenceData.state = "Custom lists";
    else if (presenceData.state) delete presenceData.state;
  } else if (document.location.pathname.includes("/events")) {
    presenceData.details = "Events";
    presenceData.state = "Home";

    if (document.location.pathname.includes("/events/calendar/"))
      presenceData.state = "Calendar";
    else if (document.location.pathname.includes("/events/going"))
      presenceData.state = "Confirmed";
    else if (document.location.pathname.includes("/events/invites"))
      presenceData.state = "Invites";
    else if (document.location.pathname.includes("/events/interested"))
      presenceData.state = "Interested";
    else if (document.location.pathname.includes("/events/hosting"))
      presenceData.state = "Self-hosted events";
    else if (document.location.pathname.includes("/events/past"))
      presenceData.state = "Past events";
    else if (document.location.pathname.includes("/events/birthdays"))
      presenceData.state = "Birthdays";
    else if (document.location.pathname.includes("/events/notifications"))
      presenceData.state = "Notifications";
    else if (document.location.pathname.includes("/events/create"))
      presenceData.state = "Creating event";
    else if (document.location.pathname.includes("/events/search")) {
      if (!privacyMode) {
        presenceData.details = "Events - Search";
        presenceData.state = document.querySelectorAll<HTMLInputElement>(
          "label.rq0escxv.a8c37x1j.a5nuqjux.l9j0dhe7.k4urcfbm > input.oajrlxb2.rq0escxv.f1sip0of.hidtqoto[type='search']"
        )?.[1]?.value;
      } else presenceData.state = "Search";
    } else if (/events\/[0-9]/g.test(document.location.pathname)) {
      if (!privacyMode) {
        presenceData.details = "Events - Viewing";
        presenceData.state = document.querySelector(
          "span > span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.pby63qed"
        )?.textContent;

        presenceData.buttons = [
          {
            label: "View Event",
            url: `https://www.facebook.com/events/${document.location.pathname.replace(
              /^\D+/g,
              ""
            )}`
          }
        ];
      } else presenceData.state = "Viewing event";
    }
  } else if (document.location.pathname.includes("/pages/"))
    presenceData.details = "Pages - Browsing";
  else if (document.location.pathname.includes("/oculus/"))
    presenceData.details = "oculus - Browsing";
  else if (document.location.pathname.includes("/events/"))
    presenceData.details = "Events - Browsing";
  else if (document.location.pathname.includes("/games/"))
    presenceData.details = "Games - Browsing";
  else if (document.location.pathname.includes("/gaming/")) {
    presenceData.details = "Gaming";

    if (document.location.pathname.includes("/gaming/feed"))
      presenceData.state = "Feed";
    else if (document.location.pathname.includes("/gaming/following"))
      presenceData.state = "Following";
    else if (document.location.pathname.includes("/gaming/browse/")) {
      presenceData.details = "Gaming - Browsing";

      if (document.location.pathname.includes("/gaming/browse/games"))
        presenceData.state = "Games";
      else if (document.location.pathname.includes("/gaming/browse/live"))
        presenceData.state = "Livestreams";
      else if (document.location.pathname.includes("/gaming/browse/streamers"))
        presenceData.state = "Streamers";
    } else if (document.location.pathname.includes("/gaming/recent/")) {
      presenceData.details = "Gaming - Recent";

      if (document.location.pathname.includes("/gaming/recent/activity"))
        presenceData.state = "Activity";
      else if (document.location.pathname.includes("/gaming/recent/streamers"))
        presenceData.state = "Streamer";
      else if (document.location.pathname.includes("/gaming/recent/history"))
        presenceData.state = "Videos";
    } else if (document.location.pathname.includes("/gaming/tournaments")) {
      presenceData.details = "Gaming - Tournaments";

      if (document.location.pathname.includes("/gaming/tournaments/hosted"))
        presenceData.state = "Self-hosted";
      else if (
        document.location.pathname.includes("/gaming/tournaments/registered")
      )
        presenceData.state = "Participated";
      else if (
        document.location.pathname.includes("/gaming/tournaments/completed")
      )
        presenceData.state = "Completed";
      else {
        presenceData.details = "Gaming";
        presenceData.state = "Tournaments";
      }
    } else if (document.location.pathname.includes("/gaming/play")) {
      presenceData.details = "Gaming - Play";

      if (/gaming\/play\/[0-9]/g.test(document.location.pathname)) {
        if (!privacyMode) {
          presenceData.state = document.querySelector(
            "span > span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5.ojkyduve"
          )?.textContent;

          presenceData.buttons = [
            {
              label: "Play Game",
              url: `https://www.facebook.com/gaming/play/${document.location.pathname.replace(
                /^\D+/g,
                ""
              )}`
            }
          ];
        } else {
          presenceData.details = "Gaming";
          presenceData.state = "Play";
        }
      } else if (document.location.pathname.includes("/gaming/play/registered"))
        presenceData.state = "Participated";
      else if (document.location.pathname.includes("/gaming/play/completed"))
        presenceData.state = "Completed";
      else {
        presenceData.details = "Gaming";
        presenceData.state = "Play";
      }
    } else if (document.location.pathname.includes("/gaming/instantgames/"))
      presenceData.state = "Instant games";
  } else if (document.location.pathname.includes("/salegroups/"))
    presenceData.details = "SaleGroups - Browsing";
  else if (document.location.pathname.includes("/jobs/"))
    presenceData.details = "Jobs - Browsing";
  else if (document.location.pathname.includes("/ads/"))
    presenceData.details = "Ads - Browsing";
  else if (document.location.pathname.includes("/weather/"))
    presenceData.details = "Viewing todays weather";
  else if (document.location.pathname.includes("/saved/"))
    presenceData.details = "Saved - Browsing";
  else if (document.location.pathname.includes("/offers/"))
    presenceData.details = "Offers - Browsing";
  else if (document.location.pathname.includes("/recommendations/"))
    presenceData.details = "Recommendations - Browsing";
  else if (document.location.pathname.includes("/bookmarks"))
    presenceData.details = "Bookmarks - Browsing";
  else if (document.location.pathname.includes("/news"))
    presenceData.details = "News - Browsing";
  else if (document.location.pathname.includes("/search")) {
    const query = new URLSearchParams(location.search).get("q");

    presenceData.smallImageKey = "search";
    if (privacyMode) presenceData.details = "Searching for something";
    else {
      presenceData.details = "Searching for:";
      presenceData.state = showSeachQuery ? query : "(Hidded)";
    }
  } else if (
    document.querySelector("div.bi6gxh9e.aov4n071 span") &&
    document.querySelector(
      "div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.i1fnvgqd.gs1a9yip.owycx6da.btwxx1t3.pxsmfnpt.pedkr2u6.n1dktuyu.dvqrsczn.l23jz15m.d4752i1f > div > div > div > div > div > div"
    )
  ) {
    const hasCheckInTab = !!Array.from(
        document.querySelector(
          "div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.i1fnvgqd.gs1a9yip.owycx6da.btwxx1t3.pxsmfnpt.pedkr2u6.n1dktuyu.dvqrsczn.l23jz15m.d4752i1f > div > div > div > div > div > div"
        ).children
      ).find((x: HTMLAnchorElement) => x.href?.endsWith("/map")),
      name = document
        .querySelector("div.bi6gxh9e.aov4n071 span")
        .textContent.trim();

    presenceData.details = `Viewing ${hasCheckInTab ? "user" : "page"}:`;
    presenceData.state = name;
  } else if (document.location.pathname.includes("/settings"))
    presenceData.details = "Settings";
  else if (document.location.pathname.includes("/places"))
    presenceData.details = "Places";
  else if (document.location.pathname === "/")
    presenceData.details = "Viewing home page";

  if (!showTimestamp || dontShowTmp) {
    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;
  }

  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
