/*
https://github.com/nuomibinggao/Prettier-Tags
Version II Alpha 1
For Overlayer v5.9.1 and Overlayer.Module.ADOFAI v1.4.2
*/

import "../impl.js";

/*
─────────────────────────────────────────────
Lib - internal utility helpers (not registered as tags)
─────────────────────────────────────────────
*/
class Lib {
  static Round(Value, Decimals) {
    return parseFloat(Value.toFixed(Decimals));
  }
  static Pad(Value, Length) {
    return String(Value).padStart(Length, "0");
  }

  static GradientText(TagName, MinRange, MaxRange, Hex1, Hex2, Text) {
    return `<color=#${Tag.ColorRange(TagName, MinRange, MaxRange, Hex1, Hex2)}>${Text}</color>`;
  }
  static ValueBasedColorRange(
    Value,
    MinRange,
    MaxRange,
    Hex1 = "FFFFFF",
    Hex2 = "FFFFFF",
    Text,
  ) {
    const h1 = (Hex1 || "FFFFFF")
      .replace(/^#/, "")
      .toLowerCase()
      .replace(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i, "$1$1$2$2$3$3");
    const h2 = (Hex2 || "FFFFFF")
      .replace(/^#/, "")
      .toLowerCase()
      .replace(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i, "$1$1$2$2$3$3");
    if (h1.length !== 6 || h2.length !== 6)
      return `<color=#FFFFFF>${Text}</color>`;
    if (MinRange === MaxRange) return `<color=#${h1}>${Text}</color>`;

    const t = Math.max(
      0,
      Math.min(1, (Value - MinRange) / (MaxRange - MinRange)),
    );
    const a = parseInt(h1, 16),
      b = parseInt(h2, 16);
    const r = Math.round((a >> 16) + ((b >> 16) - (a >> 16)) * t);
    const g = Math.round(
      ((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * t,
    );
    const bl = Math.round((a & 255) + ((b & 255) - (a & 255)) * t);
    const Hex = ((1 << 24) | (r << 16) | (g << 8) | bl)
      .toString(16)
      .slice(1)
      .toLowerCase();

    return `<color=#${Hex}>${Text}</color>`;
  }
  static XStyleWrapper(
    Text,
    Stops = [
      { Position: 0.0, Color: "FFCCCC" },
      { Position: 0.2, Color: "FFFFFF" },
      { Position: 0.8, Color: "FFFFFF" },
      { Position: 1.0, Color: "AFD4FF" },
    ],
    MinLength = 2,
  ) {
    if (Text.length === 0) return Text;

    if (Text.length < MinLength) {
      return `<color=#FFFFFF>${Text}</color>`;
    }

    const HexToRgb = (HexColor) =>
      [0, 2, 4].map((Offset) =>
        parseInt(HexColor.slice(Offset, Offset + 2), 16),
      );

    const RgbToHex = (RgbColor) =>
      RgbColor.map((Channel) =>
        Math.round(Channel).toString(16).padStart(2, "0"),
      )
        .join("")
        .toUpperCase();

    const ColorAt = (Progress) => {
      if (Progress <= Stops[0].Position) return Stops[0].Color;

      for (let StopIndex = 1; StopIndex < Stops.length; StopIndex++) {
        const StartStop = Stops[StopIndex - 1];
        const EndStop = Stops[StopIndex];

        if (Progress <= EndStop.Position) {
          const BlendAmount =
            (Progress - StartStop.Position) /
            (EndStop.Position - StartStop.Position || 1);
          const StartRgb = HexToRgb(StartStop.Color);
          const EndRgb = HexToRgb(EndStop.Color);

          return RgbToHex(
            StartRgb.map(
              (Channel, ChannelIndex) =>
                Channel + (EndRgb[ChannelIndex] - Channel) * BlendAmount,
            ),
          );
        }
      }

      return Stops[Stops.length - 1].Color;
    };

    const LastIndex = Math.max(Text.length - 1, 1);
    let Result = "";

    for (let CharIndex = 0; CharIndex < Text.length; CharIndex++) {
      const Character = Text[CharIndex];

      Result += /\s/.test(Character)
        ? Character
        : `<color=#${ColorAt(CharIndex / LastIndex)}>${Character}</color>`;
    }

    return Result;
  }

  static RawSongPercentage(Decimals = 14) {
    // 14 decimal places is the default of Overlayer mod native tags
    const CurTime =
      Tag.SongMinute() * 60 + Tag.SongSecond() + Tag.SongMilliSecond() / 1000;
    const TotalTime =
      Tag.TotalMinute() * 60 +
      Tag.TotalSecond() +
      Tag.TotalMilliSecond() / 1000;
    return TotalTime === 0
      ? 0
      : Tag.TileProgress() === 1 && CurTime === 0
        ? 100
        : parseFloat(((CurTime / TotalTime) * 100).toFixed(Decimals));
  }

  static RunStatus(ReturnType) {
    if (ReturnType === "Code") {
      if (Tag.Miss() > 0 || Tag.Overload() > 0) return "D";
      else if (
        Tag.XAccuracy() === 1 ||
        !Number.isFinite(Tag.XAccuracyPercent())
      )
        return Tag.P() === Tag.XP() ? "XPP" : "PP";
      else if (Tag.T() + Tag.V() === 0) return "AP";
      else if (Tag.TE() === 0) return "FC";
      else return "N";
    }
    if (ReturnType === "Hex") {
      if (Tag.Miss() > 0 || Tag.Overload() > 0) return Tag.FOHex();
      else if (
        Tag.XAccuracy() === 1 ||
        !Number.isFinite(Tag.XAccuracyPercent())
      )
        return Tag.P() === Tag.XP() ? "FFFFFF" : "FFDA00";
      else if (Tag.T() + Tag.V() === 0) return Tag.EPHex();
      else if (Tag.TE() === 0) return "87CEFA";
      else return "FFFFFF";
    }
    if (ReturnType === "Label") {
      if (Tag.Miss() > 0 || Tag.Overload() > 0)
        return `<color=#${Tag.FOHex()}>${Tag.Overload() + Tag.Miss()} Death</color>`;
      else if (
        Tag.XAccuracy() === 1 ||
        !Number.isFinite(Tag.XAccuracyPercent())
      )
        return Tag.P() === Tag.XP()
          ? `${Lib.XStyleWrapper("XPure Perfect!")}</color>`
          : `<color=#FFDA00>Pure Perfect!</color>`;
      else if (Tag.T() + Tag.V() === 0)
        return `<color=#${Tag.EPHex()}>All Perfect!</color>`;
      else if (Tag.TE() === 0) return `<color=#87CEFA>Full Combo!</color>`;
      else return `<color=#FFFFFF>Cleared!</color>`;
    }
  }

  // Original idea & logic from iTags, Opacity parameter & optimized function from Better iTags Alpha
  static RGB(OpacityPercentage = 100) {
    const ClampedPercentage = Math.max(0, Math.min(100, OpacityPercentage));
    const AlphaValue = Math.round((ClampedPercentage / 100) * 255);
    const AlphaString = AlphaValue.toString(16).padStart(2, "0");

    const Ms = Tag.Millisecond();
    const Ranges = [
      {
        Start: 0,
        End: 166,
        From: `FF0000${AlphaString}`,
        To: `FFFF00${AlphaString}`,
      },
      {
        Start: 166,
        End: 333,
        From: `FFFF00${AlphaString}`,
        To: `00FF00${AlphaString}`,
      },
      {
        Start: 333,
        End: 500,
        From: `00FF00${AlphaString}`,
        To: `00FFFF${AlphaString}`,
      },
      {
        Start: 500,
        End: 666,
        From: `00FFFF${AlphaString}`,
        To: `0000FF${AlphaString}`,
      },
      {
        Start: 666,
        End: 833,
        From: `0000FF${AlphaString}`,
        To: `FF00FF${AlphaString}`,
      },
      {
        Start: 833,
        End: 1000,
        From: `FF00FF${AlphaString}`,
        To: `FF0000${AlphaString}`,
      },
    ];

    for (const Range of Ranges) {
      if (Ms < Range.End) {
        return Tag.ColorRange(
          "Millisecond",
          Range.Start,
          Range.End,
          Range.From,
          Range.To,
        );
      }
    }
  }
}

/*
─────────────────────────────────────────────
Styled Tags - styled tags from the original Overlayer
─────────────────────────────────────────────
*/

class StyledTags {
  /*
  ─────────────────────────────────────────────
  Progresses - progress percentage tags
  ─────────────────────────────────────────────
  */
  static StyledTileProgressPercent(Hex1, Hex2, Decimals) {
    const Value =
      Tag.StartTile() === 1 && Tag.CurTile() === 1
        ? 0
        : parseFloat(Tag.TileProgressPercent().toFixed(Decimals));
    return Lib.GradientText("TileProgressPercent", 0, 100, Hex1, Hex2, Value);
  }
  static StyledSongProgressPercent(Hex1, Hex2, Decimals) {
    return Lib.ValueBasedColorRange(
      Lib.RawSongPercentage(),
      0,
      100,
      Hex1,
      Hex2,
      Lib.RawSongPercentage(Decimals),
    );
  }
  static StyledStartProgressPercent(Hex1, Hex2, Decimals) {
    return Lib.GradientText(
      "StartProgressPercent",
      0,
      100,
      Hex1,
      Hex2,
      Tag.StartTile() === 1
        ? 0
        : parseFloat(Tag.StartProgressPercent().toFixed(Decimals)),
    );
  }
  static StyledBestProgressPercent(Hex1, Hex2, Decimals) {
    return Lib.GradientText(
      "BestProgressPercent",
      0,
      100,
      Hex1,
      Hex2,
      Tag.BestProgress() === Tag.TileProgress() && Tag.CurTile() === 1
        ? 0
        : parseFloat(Tag.BestProgressPercent().toFixed(Decimals)),
    );
  }
  /*
  ─────────────────────────────────────────────
  Accuracies - accuracy related tags
  ─────────────────────────────────────────────
  */
  static StyledAcc(Hex1, Hex2, Decimals) {
    const Raw = Tag.AccuracyPercent();
    const Acc = Number.isFinite(Raw) && Tag.IsStarted() ? Raw : 100;
    return Lib.RunStatus("Code") === "XPP"
      ? `${Lib.XStyleWrapper(Acc)}%`
      : Lib.RunStatus("Code") !== "N"
        ? `<color=#${Lib.RunStatus("Hex")}>${Lib.Round(Acc, Decimals)}</color>%`
        : `${Lib.GradientText("XAccuracyPercent", 0, 100, Hex2, Hex1, Lib.Round(Acc, Decimals))}</color>%`;
  }
  static StyledXAcc(Hex1, Hex2, Decimals) {
    const Raw = Tag.XAccuracyPercent();
    const XAcc = Number.isFinite(Raw) ? Raw : 100;
    return Lib.RunStatus("Code") === "XPP"
      ? `${Lib.XStyleWrapper("100")}%`
      : Lib.RunStatus("Code") !== "N"
        ? `<color=#${Lib.RunStatus("Hex")}>${Lib.Round(XAcc, Decimals)}</color>%`
        : `${Lib.GradientText("XAccuracyPercent", 0, 100, Hex2, Hex1, Lib.Round(XAcc, Decimals))}</color>%`;
  }

  static StyledMaxXAcc(Hex1, Hex2, Decimals) {
    const Deaths = Tag.Miss() + Tag.Overload();
    const ELPerfects = Tag.EP() + Tag.LP();

    const TotalJudged = Tag.P() + ELPerfects + Tag.V() + Tag.T() + Deaths;
    const TotalTiles = TotalJudged + Tag.LeftTile();

    const MaxRawAccuracy =
      (Tag.P() +
        Tag.LeftTile() +
        0.75 * ELPerfects +
        0.4 * Tag.V() +
        0.2 * Tag.T()) /
      TotalTiles;
    const MaxXAccuracy = isFinite(MaxRawAccuracy)
      ? Lib.Round(
          MaxRawAccuracy * Math.pow(0.9875, Tag.CheckpointsUsed()) * 100,
          Decimals,
        )
      : 100;
    const DisplayedValue =
      MaxXAccuracy === 100 && Tag.XAccuracy() < 1
        ? Number(`99.${"9".repeat(Decimals)}`)
        : MaxXAccuracy;
    return Lib.RunStatus("Code") === "XPP"
      ? `${Lib.XStyleWrapper("100")}%`
      : Lib.RunStatus("Code") !== "N"
        ? `<color=#${Lib.RunStatus("Hex")}>${DisplayedValue}</color>%`
        : `${Lib.ValueBasedColorRange(DisplayedValue, 0, 100, Hex2, Hex1, DisplayedValue)}</color>%`;
  }
  /*
  ─────────────────────────────────────────────
  Chart Data - BPM, KPS, and angle data tags
  ─────────────────────────────────────────────
  */
  static StyledTileBPM(Hex1, Hex2, Decimals, MaxRange) {
    return `${Lib.GradientText("TileBpm", 0, MaxRange, Hex1, Hex2, Lib.Round(Tag.TileBpm(), Decimals))}`;
  }
  static StyledActualBPM(Hex1, Hex2, Decimals, MaxRange) {
    const Value = !isFinite(Tag.CurBpm()) ? Tag.TileBpm() : Tag.CurBpm();
    return `${Lib.GradientText("CurBpm", 0, MaxRange, Hex1, Hex2, Lib.Round(Value, Decimals))}`;
  }

  static StyledKPS(Hex1, Hex2, Decimals, MaxRange) {
    const Value = !isFinite(Tag.BpmKps())
      ? Lib.Round(Tag.TileBpm() / 60, Decimals)
      : Lib.Round(Tag.BpmKps(), Decimals);
    return `${Lib.ValueBasedColorRange(Value, 0, MaxRange, Hex1, Hex2, Value)}`;
  }

  static StyledCurAngleData(Hex1, Hex2, Decimals) {
    const CurBpm = !isFinite(Tag.CurBpm()) ? Tag.TileBpm() : Tag.CurBpm();
    const Value = 180 * (Tag.TileBpm() / CurBpm);
    return `${Lib.ValueBasedColorRange(Math.abs(Value - 180), 0, 180, Hex1, Hex2, Lib.Round(Value, Decimals))}`;
  }
}

class UIComponents {
  /*
  ─────────────────────────────────────────────
  Level Data - information of the level metadata
  ─────────────────────────────────────────────
  */
  static StyledTileInfoDisplay(Hex1, Hex2) {
    return `${Lib.GradientText("CurTile", 0, Tag.TotalTile() - 1, Hex1, Hex2, Tag.CurTile() - 1)}<color=#FFFFFF> / <color=#${Hex2}>${Tag.TotalTile() - 1}<color=#FFFFFF> (-${Lib.GradientText("LeftTile", 0, Tag.TotalTile() - 1, Hex2, Hex1, Tag.LeftTile())}<color=#FFFFFF>)</color>`;
  }

  static StyledDuration(Hex1, Hex2) {
    const MapSeconds =
      Tag.SongHour() * 3600 + Tag.SongMinute() * 60 + Tag.SongSecond();
    const MapTotalSeconds =
      Tag.TotalHour() * 3600 + Tag.TotalMinute() * 60 + Tag.TotalSecond();

    const WithHourTotalDurationDisplay = `<color=#${Hex2}>${Tag.TotalHour()}${Lib.Pad(Tag.TotalMinute(), 2)}:${Lib.Pad(Tag.TotalSecond(), 2)}</color>`;
    const WithoutHourTotalDurationDisplay = `<color=#${Hex2}>${Tag.TotalMinute()}:${Lib.Pad(Tag.TotalSecond(), 2)}</color>`;

    const WithHourMapDurationDisplay =
      MapSeconds === 0 && Tag.TileProgress() === 1
        ? WithHourTotalDurationDisplay
        : `${Tag.SongHour()}${Lib.Pad(Tag.SongMinute(), 2)}:${Lib.Pad(Tag.SongSecond(), 2)}`;
    const WithoutHourMapDurationDisplay =
      MapSeconds === 0 && Tag.TileProgress() === 1
        ? WithoutHourTotalDurationDisplay
        : `${Tag.SongMinute()}:${Lib.Pad(Tag.SongSecond(), 2)}`;

    let DisplayedMapDuration;

    if (MapTotalSeconds === 0) {
      DisplayedMapDuration = Lib.ValueBasedColorRange(
        Tag.TileProgress(),
        0,
        1,
        Hex1,
        Hex2,
        Tag.TotalHour() > 0
          ? WithHourMapDurationDisplay
          : WithoutHourMapDurationDisplay,
      );
    } else {
      DisplayedMapDuration = Lib.ValueBasedColorRange(
        MapSeconds,
        0,
        MapTotalSeconds,
        Hex1,
        Hex2,
        Tag.TotalHour() > 0
          ? WithHourMapDurationDisplay
          : WithoutHourMapDurationDisplay,
      );
    }
    const DisplayedTotalDuration =
      Tag.TotalHour() > 0
        ? WithHourTotalDurationDisplay
        : WithoutHourTotalDurationDisplay;

    return `${DisplayedMapDuration} <color=#FFFFFF>/ ${DisplayedTotalDuration}`;
  }

  static StyledTitleDisplay(
    HexOverride,
    OverallSize,
    LineSpacing,
    SpeedSize,
    SecondLineSize,
    AuthorSize,
    CJKCharSize,
  ) {
    const O = OverallSize;

    const CJK_RE =
      /[\u3000-\u9fff\ua000-\ua48f\ua490-\ua4ff\ua960-\ua97f\uac00-\ud7ff\uf900-\ufaff\ufe10-\ufe1f\ufe30-\ufe4f\ufe50-\ufe6f\uff00-\uffef\u{1b000}-\u{1b0ff}\u{1b100}-\u{1b12f}\u{1b170}-\u{1b2ff}\u{20000}-\u{2a6df}\u{2a700}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}]/u;

    const ParseScaleAndWrapCJK = (Str, ContextSize) => {
      if (!Str) return "";
      const Normalized = Str.replace(
        /color\s*=\s*(['"])(.*?)\1/gi,
        "color=$2",
      ).replace(
        /<color=#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})?>/g,
        (_, Hex6, Alpha) => (Alpha === "00" ? "" : `<color=#${Hex6}>`),
      );

      let ActiveSize = ContextSize;
      const SizeStack = [];

      return Normalized.replace(
        /(<size=(\d+(?:\.\d+)?)(?!%)>)|(<size=(\d+(?:\.\d+)?)%>)|(<\/size>)|(<[^>]*>)|(\S)/gu,
        (Match, AbsOpen, AbsVal, PctOpen, PctVal, Close, OtherTag, Char) => {
          if (AbsOpen) {
            const Scaled = Lib.Round((AbsVal / 85) * ActiveSize, 0);
            SizeStack.push(ActiveSize);
            ActiveSize = Scaled;
            return `<size=${Scaled}%>`;
          }
          if (PctOpen) {
            SizeStack.push(ActiveSize);
            ActiveSize = parseFloat(PctVal);
            return Match;
          }
          if (Close) {
            ActiveSize = SizeStack.pop() ?? ContextSize;
            return Match;
          }
          if (OtherTag) return Match;
          if (Char && CJK_RE.test(Char)) {
            const CJKSize = Lib.Round((CJKCharSize * ActiveSize) / 100, 0);
            return `<size=${CJKSize}%>${Char}</size>`;
          }
          return Match;
        },
      );
    };

    const SplitTitle = (Str) => {
      const Cleaned = Str.replace(
        /\n(?:\s*<color=#(?:[A-Fa-f0-9]{6})?00>)*\s*$/gim,
        "",
      );
      const Idx = Cleaned.search(/\n| {10,}/);
      if (Idx === -1) return [Cleaned, null];
      const Rest = Cleaned.slice(Idx).replace(/^\n| {10,}/, "");
      return [Cleaned.slice(0, Idx), Rest];
    };

    const StripLeadingTransparent = (Str) =>
      Str.replace(
        /^((?:\s*(?:<size=[^>]*>|<color=(?:"#|'#|#)[A-Fa-f0-9]{6}(?:[A-Fa-f0-9]{2})?(?:"|')?>))*)/,
        (Match) =>
          Match.replace(
            /<color=(?:"#|'#|#)[A-Fa-f0-9]{6}([A-Fa-f0-9]{2})?(?:"|')?>/gi,
            (Tag, Alpha) => (Alpha?.toLowerCase() === "00" ? "" : Tag),
          ),
      );

    const ArtistRawStr = Tag.ArtistRaw();
    const TitleRawStr = Tag.TitleRaw();
    const AuthorRawStr = Tag.AuthorRaw();
    const ActualSpeed = Tag.SpeedPitch() * Tag.EditorPitch();

    const SecondCtx = Lib.Round((SecondLineSize * O) / 100, 0);
    const AuthorCtx = Lib.Round((AuthorSize * O) / 100, 0);
    const SpeedCtx = Lib.Round((SpeedSize * O) / 100, 0);

    const ArtistProcessed = ParseScaleAndWrapCJK(ArtistRawStr, O);

    const [TitleLine1, TitleLine2] = SplitTitle(
      ParseScaleAndWrapCJK(TitleRawStr, O),
    );
    const [, TitleLine2Rescaled] =
      TitleLine2 != null
        ? SplitTitle(ParseScaleAndWrapCJK(TitleRawStr, SecondCtx))
        : [null, null];

    const AuthorProcessed = ParseScaleAndWrapCJK(AuthorRawStr, AuthorCtx);

    const SpeedDisplay =
      ActualSpeed !== 1
        ? ` <color=#${HexOverride}><size=${SpeedCtx}%>(${ActualSpeed}\u00d7)</size></color>`
        : "";

    const ArtistPrefix = ArtistProcessed ? `${ArtistProcessed} - ` : "";
    const Line1 = `<size=${O}%>${ArtistPrefix}${TitleLine1 ?? ""}</size>`;
    const Line2 =
      TitleLine2 != null
        ? `\n<size=${SecondCtx}%>${TitleLine2Rescaled ?? ""}</size>${SpeedDisplay}`
        : SpeedDisplay;

    const TopTitle = (Line1 + Line2)
      .replace(/^.*/, (M) => StripLeadingTransparent(M))
      .replace(/(?<=\n).*/, (M) => StripLeadingTransparent(M));

    const AuthorLine = AuthorProcessed
      ? `<color=#${HexOverride}><size=${AuthorCtx}%>Level By ${AuthorProcessed}</size></color>\n`
      : "";

    return TopTitle.replace(/<[^>]*>/g, "").trim()
      ? `<line-height=${LineSpacing}%>${TopTitle}\n${AuthorLine}</line-height>`
      : SpeedDisplay;
  }
  /*
  ─────────────────────────────────────────────
  System Data - system performance and data
  ─────────────────────────────────────────────
  */
  static DateDisplay(
    DateHex,
    TimeHex,
    Spacings,
    System,
    SubscriptSizePercentage,
  ) {
    const AmPmIndicator = Tag.Hour() >= 12 ? "P.M." : "A.M.";
    const TwelveHourClockSystemHour =
      Tag.Hour() % 12 === 0 ? 12 : Tag.Hour() % 12;

    const MonthNames = [
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "Jun.",
      "Jul.",
      "Aug.",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];

    const CurrentMonthName = MonthNames[Tag.Month() - 1];
    const CurrentDay = Tag.Day();

    function GetOrdinalSuffix(day) {
      if (day >= 11 && day <= 13) return "th";

      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    const OrdinalDay = `${CurrentDay}<size=${SubscriptSizePercentage}%>${GetOrdinalSuffix(CurrentDay)}</size>`;

    return Number(System) === 12
      ? `<color=#${DateHex}>${CurrentMonthName} ${OrdinalDay}, ${Tag.Year()}</color>${" ".repeat(Spacings)}<color=#${TimeHex}>${TwelveHourClockSystemHour}:${Lib.Pad(Tag.Minute(), 2)}<size=${SubscriptSizePercentage}%>:${Lib.Pad(Tag.Second(), 2)} ${AmPmIndicator}</size></color>`
      : Number(System) === 24
        ? `<color=#${DateHex}>${CurrentMonthName} ${OrdinalDay}, ${Tag.Year()}</color>${" ".repeat(Spacings)}<color=#${TimeHex}>${Lib.Pad(Tag.Hour(), 2)}:${Lib.Pad(Tag.Minute(), 2)}:${Lib.Pad(Tag.Second(), 2)}</color>`
        : `Error: Parameter "System" can only be values 12 or 24.`;
  }

  static StyledFPS(Hex1, Hex2, WarningHex, WarningThreshold, Decimals) {
    const TargetFPS =
      Tag.TargetFrameRate() === 10000
        ? `<size=125%>\u221e</size>`
        : Tag.TargetFrameRate();
    return Tag.Fps() <= WarningThreshold
      ? `<color=#${WarningHex}>${Lib.Round(Tag.Fps(), Decimals)}</color> / <color=#${Hex2}>${Tag.TargetFrameRate()}</color>`
      : `${Lib.GradientText("Fps", 0, WarningThreshold, Hex1, Hex2, Lib.Round(Tag.Fps(), Decimals))} / <color=#${Hex2}>${TargetFPS}</color>`;
  }
  /*
  ─────────────────────────────────────────────
  Player Performance - input offset, combo, and run status tags
  ─────────────────────────────────────────────
  */
  static StyledTimingAvg(Hex1, Hex2, Decimals, ThresholdMs, LabelSize) {
    const Display = Lib.Round(Tag.TimingAvgMs(), Decimals);
    const Value = Math.abs(Display);
    const Base = Math.abs(ThresholdMs);
    const Threshold =
      Tag.CurTile() <= 4
        ? Base * 4
        : Tag.TileProgress() > 7.5
          ? Base * 0.5
          : Base;
    const AutoplayLabel =
      Tag.IsAutoEnabled() || Tag.IsAutoTile()
        ? ` <size=${LabelSize}%>(<color=#${Lib.RGB(100)}>Auto</color>)</size>`
        : "";
    return `${Lib.ValueBasedColorRange(Value, 0, Threshold, Hex1, Hex2, Display)}</color>ms${AutoplayLabel}`;
  }

  static StyledPureComboDisplay(
    Hex1,
    Hex2,
    MaxCombos,
    MaxSize,
    LabelSize,
    LabelHex,
    LabelText,
    ShowThreshold,
  ) {
    const MaxTrackedCombos =
      MaxCombos > Tag.TotalTile() - 1 ? Tag.TotalTile() - 1 : MaxCombos;
    if (Tag.TileProgress() === 1)
      return `${Lib.GradientText(
        "MaxCombo",
        0,
        Tag.TotalTile() - 1,
        Hex1,
        Hex2,
        `<size=${Tag.MovingMan("MaxCombo", 100, MaxSize, 100, 800, true, "InExpo")}%>${Tag.MaxCombo()}
<size=${LabelSize}%><color=#${LabelHex}>Max Combo</color></size>`,
      )}`;
    else
      return Tag.Combo() >= ShowThreshold
        ? `${Lib.GradientText(
            "Combo",
            ShowThreshold,
            MaxTrackedCombos,
            Hex1,
            Hex2,
            `<size=${Tag.MovingMan("Combo", 100, MaxSize, 100, 800, true, "InExpo")}%>${Tag.Combo()}
<size=${LabelSize}%><color=#${LabelHex}>${LabelText}</color></size>`,
          )}`
        : "";
  }
  static StyledPerfectsComboDisplay(
    Hex1,
    Hex2,
    MaxCombos,
    MaxSize,
    LabelSize,
    LabelHex,
    LabelText,
    ShowThreshold,
  ) {
    const MaxTrackedCombos =
      MaxCombos > Tag.TotalTile() - 1 ? Tag.TotalTile() - 1 : MaxCombos;
    if (Tag.TileProgress() === 1)
      return `${Lib.ValueBasedColorRange(
        Tag.MarginMaxCombos(
          "XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|Auto",
        ),
        0,
        Tag.TotalTile() - 1,
        Hex1,
        Hex2,
        `${Tag.MarginMaxCombos("XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|Auto")}
<size=${LabelSize}%><color=#${LabelHex}>Max Combo</color></size>`,
      )}`;
    else
      return Tag.MarginCombos(
        "XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|Auto",
      ) >= ShowThreshold
        ? `${Lib.ValueBasedColorRange(
            Tag.MarginCombos(
              "XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|Auto",
            ),
            0,
            MaxTrackedCombos,
            Hex1,
            Hex2,
            `<size=${Tag.MovingMan("CurTile", 100, MaxSize, 100, 800, true, "InExpo")}%>${Tag.MarginCombos("XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|Auto")}
<size=${LabelSize}%><color=#${LabelHex}>${LabelText}</color></size>`,
          )}`
        : "";
  }
  static StyledActualComboDisplay(
    Hex1,
    Hex2,
    MaxCombos,
    MaxSize,
    LabelSize,
    LabelHex,
    LabelText,
    ShowThreshold,
  ) {
    const MaxTrackedCombos =
      MaxCombos > Tag.TotalTile() - 1 ? Tag.TotalTile() - 1 : MaxCombos;
    if (Tag.TileProgress() === 1)
      return `${Lib.ValueBasedColorRange(
        Tag.MarginMaxCombos(
          "XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|VeryEarly|VeryLate|Auto",
        ),
        0,
        Tag.TotalTile() - 1,
        Hex1,
        Hex2,
        `${Tag.MarginMaxCombos("XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|VeryEarly|VeryLate|Auto")}
<size=${LabelSize}%><color=#${LabelHex}>Max Combo</color></size>`,
      )}`;
    else
      return Tag.MarginCombos(
        "XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|VeryEarly|VeryLate|Auto",
      ) >= ShowThreshold
        ? `${Lib.ValueBasedColorRange(
            Tag.MarginCombos(
              "XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|VeryEarly|VeryLate|Auto",
            ),
            0,
            MaxTrackedCombos,
            Hex1,
            Hex2,
            `<size=${Tag.MovingMan("CurTile", 100, MaxSize, 100, 800, true, "InExpo")}%>${Tag.MarginCombos("XPerfect|PerfectMinus|PerfectPlus|EarlyPerfect|LatePerfect|VeryEarly|VeryLate|Auto")}
<size=${LabelSize}%><color=#${LabelHex}>${LabelText}</color></size>`,
          )}`
        : "";
  }
  static StyledAdaptiveComboDisplay(Hex1, Hex2, MaxSize, LabelSize, LabelHex) {
    if (Tag.IsAutoEnabled() || Tag.IsAutoTile())
      return `<size=${Tag.MovingMan("Combo", 100, MaxSize, 100, 800, true, "InExpo")}%><color=#${Lib.RGB(100)}>${Tag.Combo()}
<color=#${LabelHex}><size=${LabelSize}%>Autoplay</size></color>`;
    else if (Tag.Difficulty() === "Strict")
      return this.StyledPureComboDisplay(
        Hex1,
        Hex2,
        3000,
        MaxSize,
        LabelSize,
        LabelHex,
        "Perfect Combo",
        3,
      );
    else if (Tag.Difficulty() === "Lenient")
      return this.StyledActualComboDisplay(
        Hex1,
        Hex2,
        10000,
        MaxSize,
        LabelSize,
        LabelHex,
        "Combo",
        10,
      );
    else if (Tag.Difficulty() === "Normal")
      return this.StyledPerfectsComboDisplay(
        Hex1,
        Hex2,
        5000,
        MaxSize,
        LabelSize,
        LabelHex,
        "Perfects Combo",
        5,
      );
  }

  static StyledAdaptiveStatusLabel(
    Hex1,
    Hex2,
    ProgressDecimals,
    MarginDecimals,
  ) {
    const DifficultyLabels = {
      Strict: "<color=#B11A1A>All Strict</color>",
      Lenient: "<color=#3ACF4E>Lenient</color> Difficulty",
      Normal: "<color=#FFFFFF>Normal</color> Difficulty",
    };
    const ColoredDifficulty = `${DifficultyLabels[Tag.DifficultyRaw()]}`;
    const AutoplayLabel = Tag.IsAutoEnabled()
      ? ` <color=#FFFFFF>(<color=#${Lib.RGB(100)}>Autoplayed</color>)`
      : "";
    const MaxComboLabel =
      Lib.RunStatus("Code") === "XPP" || Lib.RunStatus("Code") === "PP"
        ? ""
        : ` <color=#FFFFFF>(Max Combo <color=#${Lib.RunStatus("Hex")}>${Tag.MaxCombo()}</color>)`;

    if (!Tag.IsStarted() && Tag.CurTile() !== Tag.TotalTile())
      return "Get Ready...";
    else if (Tag.CurTile() !== Tag.TotalTile() && Tag.CurTile() > 0)
      return `Hit Margin Scale | <size=${Tag.MovingMan("MarginScale", 100, 150, 100, 800, true, "InExpo")}%>${Lib.ValueBasedColorRange(Math.abs(Tag.MarginScale() - 1), 0, 0.75, Hex1, Hex2, Lib.Round(Tag.MarginScale() * 100, MarginDecimals))}</color>%</size>`;
    else if ((Tag.StartTile() === 1 && Tag.TileProgress()) === 1)
      return `${ColoredDifficulty} ${Lib.RunStatus("Label")}${MaxComboLabel}</color>${AutoplayLabel}`;
    else if (
      Tag.StartTile() > 0 &&
      Tag.TileProgress() === 1 &&
      Tag.StartTile() !== Tag.TotalTile()
    )
      return (
        `${StyledTags.StyledStartProgressPercent(Hex1, Hex2, ProgressDecimals)}<color=#FFFFFF> ~ <color=#${Hex2}>100</color>% ` +
        `${ColoredDifficulty} ${Lib.RunStatus("Label")}${MaxComboLabel}</color>${AutoplayLabel}`
      );
    else if (Tag.TileProgress() === 1 && Tag.StartTile() === Tag.TotalTile())
      return "Started From Last Tile";
  }

  static StyledJudgments(Spaces) {
    return `<size=${Tag.MovingMan("Overload", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.FOHex()}>${Tag.Overload()}
<size=${Tag.MovingMan("TE", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.TEHex()}>${Tag.TE()}
<size=${Tag.MovingMan("VE", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.VEHex()}>${Tag.VE()}
<size=${Tag.MovingMan("EP", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.EPHex()}>${Tag.EP()}
<size=${Tag.MovingMan("P", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.PHex()}>${Tag.P()}
<size=${Tag.MovingMan("LP", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.LPHex()}>${Tag.LP()}
<size=${Tag.MovingMan("VL", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.VLHex()}>${Tag.VL()}
<size=${Tag.MovingMan("TL", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.TLHex()}>${Tag.TL()}
<size=${Tag.MovingMan("Miss", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.FOHex()}>${Tag.Miss()}
</color></size>`.replace(/\n/g, " ".repeat(Spaces));
  }
  static StyledXJudgments(Spaces) {
    return `-<size=${Tag.MovingMan("PM", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.PHex()}>${Tag.PM()}
<size=${Tag.MovingMan("XP", 100, 125, 100, 800, true, "InExpo")}%><color=#FFFFFF>${Lib.XStyleWrapper(Tag.XP().toString())}
<size=${Tag.MovingMan("PP", 100, 125, 100, 800, true, "InExpo")}%><color=#${Tag.PHex()}>${Tag.PP()}<color=#FFFFFF>+
</color></size>`.replace(/\n/g, " ".repeat(Spaces));
  }
}

RegisterTag("RGB", (Opacity) => Lib.RGB(Opacity), {
  ReturnType: "string",
  Desc: "[Utility] A hex value that changes over time to resemble an RGB effect.\nParameters: (Opacity)",
});

RegisterTag(
  "TileProgressPercentage",
  (Hex1, Hex2, Decimals) =>
    StyledTags.StyledTileProgressPercent(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Progress based on tiles cleared.\nParameters: (Hex1, Hex2, Decimals)",
  },
);
RegisterTag(
  "SongProgressPercentage",
  (Hex1, Hex2, Decimals) =>
    StyledTags.StyledSongProgressPercent(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Progress based on music time.\nParameters: (Hex1, Hex2, Decimals)",
  },
);
RegisterTag(
  "StartProgressPercentage",
  (Hex1, Hex2, Decimals) =>
    StyledTags.StyledStartProgressPercent(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Progress when the run started.\nParameters: (Hex1, Hex2, Decimals)",
  },
);
RegisterTag(
  "BestProgressPercentage",
  (Hex1, Hex2, Decimals) =>
    StyledTags.StyledBestProgressPercent(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Best achieved progress.\nParameters: (Hex1, Hex2, Decimals)",
  },
);

RegisterTag(
  "Acc",
  (Hex1, Hex2, Decimals) => StyledTags.StyledAcc(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Accuracy with color.\nParameters: (Hex1, Hex2, Decimals)",
  },
);
RegisterTag(
  "XAcc",
  (Hex1, Hex2, Decimals) => StyledTags.StyledXAcc(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] XAccuracy with color.\nParameters: (Hex1, Hex2, Decimals)",
  },
);
RegisterTag(
  "MaxXAcc",
  (Hex1, Hex2, Decimals) => StyledTags.StyledMaxXAcc(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] XAccuracy with color.\nParameters: (Hex1, Hex2, Decimals)",
  },
);

RegisterTag(
  "TileBPM",
  (Hex1, Hex2, Decimals, MaxRange) =>
    StyledTags.StyledTileBPM(Hex1, Hex2, Decimals, MaxRange),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Tile BPM with color.\nParameters: (Hex1, Hex2, Decimals, MaxRange)",
  },
);
RegisterTag(
  "ActualBPM",
  (Hex1, Hex2, Decimals, MaxRange) =>
    StyledTags.StyledActualBPM(Hex1, Hex2, Decimals, MaxRange),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Actual BPM with color.\nParameters: (Hex1, Hex2, Decimals, MaxRange)",
  },
);

RegisterTag(
  "KPS",
  (Hex1, Hex2, Decimals, MaxRange) =>
    StyledTags.StyledKPS(Hex1, Hex2, Decimals, MaxRange),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] KPS with color.\nParameters: (Hex1, Hex2, Decimals, MaxRange)",
  },
);

RegisterTag(
  "AngleData",
  (Hex1, Hex2, Decimals) => StyledTags.StyledCurAngleData(Hex1, Hex2, Decimals),
  {
    ReturnType: "string",
    Desc: "[Styled Tag] Current angle of tile with color.\nParameters: (Hex1, Hex2, Decimals)",
  },
);

RegisterTag(
  "TileInfoDisplay",
  (Hex1, Hex2) => UIComponents.StyledTileInfoDisplay(Hex1, Hex2),
  {
    ReturnType: "string",
    Desc: "[UI Components] Displays the information about the tiles of the current level.\nParameters: (Hex1, Hex2)",
  },
);

RegisterTag(
  "DurationDisplay",
  (Hex1, Hex2) => UIComponents.StyledDuration(Hex1, Hex2),
  {
    ReturnType: "string",
    Desc: "[UI Component] The duration of the song playing in the current level.\nParameters: (Hex1, Hex2)",
  },
);

RegisterTag(
  "TitleDisplay",
  (
    HexOverride,
    OverallSize,
    LineSpacing,
    SpeedSize,
    SecondLineSize,
    AuthorSize,
    CJKCharSize,
  ) =>
    UIComponents.StyledTitleDisplay(
      HexOverride,
      OverallSize,
      LineSpacing,
      SpeedSize,
      SecondLineSize,
      AuthorSize,
      CJKCharSize,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Advanced and fance title display.\nParameters: (HexOverride, OverallSize, LineSpacing, SpeedSize, SecondLineSize, AuthorSize, CJKCharSize)",
  },
);

RegisterTag(
  "DateDisplay",
  (DateHex, TimeHex, Spacings, System, SubscriptSizePercentage) =>
    UIComponents.DateDisplay(
      DateHex,
      TimeHex,
      Spacings,
      System,
      SubscriptSizePercentage,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the real life time.\nParameters: (DateHex, TimeHex, Spacings, System, SubscriptSizePercentage)",
  },
);

RegisterTag(
  "FPSDisplay",
  (Hex1, Hex2, WarningHex, WarningThreshold, Decimals) =>
    UIComponents.StyledFPS(Hex1, Hex2, WarningHex, WarningThreshold, Decimals),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the FPS and target FPS.\nParameters: (Hex1, Hex2, WarningHex, WarningThreshold, Decimals)",
  },
);

RegisterTag(
  "AvgInputOffset",
  (Hex1, Hex2, Decimals, ThresholdMs, LabelSize) =>
    UIComponents.StyledTimingAvg(Hex1, Hex2, Decimals, ThresholdMs, LabelSize),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the average input offset, along with an autoplay/auto tile label.\nParameters: (Hex1, Hex2, Decimals, ThresholdMs, LabelSize)",
  },
);

RegisterTag(
  "PureComboDisplay",
  (
    Hex1,
    Hex2,
    MaxCombos,
    MaxSize,
    LabelSize,
    LabelHex,
    LabelText,
    ShowThreshold,
  ) =>
    UIComponents.StyledPureComboDisplay(
      Hex1,
      Hex2,
      MaxCombos,
      MaxSize,
      LabelSize,
      LabelHex,
      LabelText,
      ShowThreshold,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the Pure Perfect Combos.\nParameters: (Hex1, Hex2, MaxCombos, MaxSize, LabelSize, LabelHex, LabelText, ShowThreshold)",
  },
);
RegisterTag(
  "PerfectsComboDisplay",
  (
    Hex1,
    Hex2,
    MaxCombos,
    MaxSize,
    LabelSize,
    LabelHex,
    LabelText,
    ShowThreshold,
  ) =>
    UIComponents.StyledPerfectsComboDisplay(
      Hex1,
      Hex2,
      MaxCombos,
      MaxSize,
      LabelSize,
      LabelHex,
      LabelText,
      ShowThreshold,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the Perfects (including EPerfect and LPerfect) Combos.\nParameters: (Hex1, Hex2, MaxCombos, MaxSize, LabelSize, LabelHex, LabelText, ShowThreshold)",
  },
);
RegisterTag(
  "ActualComboDisplay",
  (
    Hex1,
    Hex2,
    MaxCombos,
    MaxSize,
    LabelSize,
    LabelHex,
    LabelText,
    ShowThreshold,
  ) =>
    UIComponents.StyledActualComboDisplay(
      Hex1,
      Hex2,
      MaxCombos,
      MaxSize,
      LabelSize,
      LabelHex,
      LabelText,
      ShowThreshold,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the combo of tiles hit until a Too Early/Late! is hit or a fail.\nParameters: (Hex1, Hex2, MaxCombos, MaxSize, LabelSize, LabelHex, LabelText, ShowThreshold)",
  },
);
RegisterTag(
  "AdaptiveComboDisplay",
  (Hex1, Hex2, MaxSize, LabelSize, LabelHex) =>
    UIComponents.StyledAdaptiveComboDisplay(
      Hex1,
      Hex2,
      MaxSize,
      LabelSize,
      LabelHex,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the appropriate combo type based on difficulty and autoplay/auto tile status.\nParameters: (Hex1, Hex2, MaxSize, LabelSize, LabelHex)",
  },
);

RegisterTag(
  "AdaptiveStatusLabel",
  (Hex1, Hex2, ProgressDecimals, MarginDecimals) =>
    UIComponents.StyledAdaptiveStatusLabel(
      Hex1,
      Hex2,
      ProgressDecimals,
      MarginDecimals,
    ),
  {
    ReturnType: "string",
    Desc: "[UI Component] Displays the Hit Margin Scale during a run and a summary at the end of each run.\nParameters: (Hex1, Hex2, ProgressDecimals, MarginDecimals)",
  },
);

RegisterTag("Judgments", (Spaces) => UIComponents.StyledJudgments(Spaces), {
  ReturnType: "string",
  Desc: "[UI Component] Displays the current judges.\nParameters: (Spaces)",
});
RegisterTag("XJudgments", (Spaces) => UIComponents.StyledXJudgments(Spaces), {
  ReturnType: "string",
  Desc: "[UI Component] Displays the current -Perfect, XPerfect, and +Perfect.\nParameters: (Spaces)",
});

function Helper() {
  return `<size=125%>Prettier Tags</size>
  Prettier Tags is an open-source script for the Overlayer mod made for the game A Dance of Fire and Ice.
It is based on iTags, Better iTags Alpha, Not Enough Tags, and maimai.js, and made by nuomibinggao / H₂O (s).
  Minimum required version of Overlayer mod is 5.9.1 along with Overlayer.Module.ADOFAI version 1.4.2, any lower versions may break some tags or cause errors.
Please make sure to update your Overlayer mod to the latest version to ensure the best experience with Prettier Tags.

  For instructions, examples, and parameter explanations of each tag, create or edit any text, and click the left most button
below the "Playing Text", and hover over each tag name to see its description and parameters.

<size=110%>Credits</size>
SamXU1322 & a6. for iTags Scripts and overall inspiration.
owosean for helping overall.`;
}
RegisterTag("Helper", () => Helper(), {
  ReturnType: "string",
  Desc: "[Tutorial] Introduction to Prettier Tags. Enter {Helper} to start!",
});
