import rectangle from "../style/rectangle.svg";
import timericon from "../style/timer-icon.svg";
import board from "../style/board.svg";

export default function Jeu() {
    return (
        <div class="playpage-game">
            <div class="playpage-infobar">
            <div class="playpage-profile left clear">
                <div class="playpage-profile-pfp">
                <img class="playpage-profile-pfp-icon" src={rectangle} />
                </div>
                <div class="playpage-profile-userdata">
                <label class="playpage-profile-username">Test</label>
                <label class="playpage-profile-userinfo">Informations</label>
                </div>
            </div>
            <div class="playpage-timer right">
                <img class="playpage-timer-icon" src={timericon} />
                <label class="playpage-timer-label">3:15</label>
            </div>
            </div>
            <img class="playpage-game-board" src={board} />
            <div class="playpage-infobar">
            <div class="playpage-profile left clear">
                <div class="playpage-profile-pfp">
                <img class="playpage-profile-pfp-icon" src={rectangle} />
                </div>
                <div class="playpage-profile-userdata">
                <label class="playpage-profile-username">Test2</label>
                <label class="playpage-profile-userinfo">Informations2</label>
                </div>
            </div>
            <div class="playpage-timer right">
                <img class="playpage-timer-icon" src={timericon} />
                <label class="playpage-timer-label">3:15</label>
            </div>
            </div>
        </div>
    )
  }
  

