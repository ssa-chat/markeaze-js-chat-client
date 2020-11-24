<script>
export const icons = require('./../libs/icons')
export const css = require('raw-loader!sass-loader!./../../stylesheets/application.sass')
export let settings
export let notice
</script>

<div mkz>
  <div class="mkz-c mkz-c_avatar_show mkz-c-js">

    <div class="mkz-c__handler mkz-c__handler_type_{appearance.bar_type} mkz-c__handler_position_{appearance.bar_position} {appearance.bar_bouncing ? 'mkz-c__handler_bouncing_yes' : ''}" style="margin: {appearance.bar_padding_y}px {appearance.bar_padding_x}px">
      <div class="mkz-c__f mkz-c-js-f">
        <div class="mkz-c__f-list-close mkz-c-js-f-close">
          {closeIcon}
        </div>
        <div class="mkz-c__f-list mkz-c-js-f-history"></div>
      </div>
      {notice()}
      <div class="mkz-c__btn mkz-c-js-toggle" style="background-color: {this.appearance.bar_bg};">
        <div class="mkz-c__btn-text">
          <span class="mkz-c__btn-text-online">{appearance.bar_text_online}</span>
          <span class="mkz-c__btn-text-offline">{appearance.bar_text_offline}</span>
        </div>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__btn-picture">
          <rect x="20" y="20" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -12.4091 29.9928)" fill="{appearance.bar_color}" width="20" height="20" fill="currentColor" class="mkz-c__btn-1" />
          <rect x="20" y="20" fill="{appearance.bar_color}" width="20" height="20" fill="currentColor" class="mkz-c__btn-2" />
          <rect x="20" y="20" fill="{appearance.bar_color}" width="20" height="20" fill="currentColor" class="mkz-c__btn-3" />
        </svg>
        <div class="mkz-c__btn-unread mkz-c-js-unread">0</div>
      </div>
    </div>

    <div class="mkz-c__chat mkz-c__chat_position_{chatPosition}" style="{width ? `max-width: {width}px;` : ''}">
      <div class="mkz-c__cart-shadow"></div>
      <div class="mkz-c__cart mkz-c-js-card">

        <div class="mkz-c__head" style="color: {appearance.title_color}; background-color: {appearance.title_bg};">

          <div class="mkz-c__head-row mkz-c__head-row_type_agent">
            <div class="mkz-c__head-title mkz-c__overflow">
              {appearance.title_text}
            </div>
            <div class="mkz-c__head-action">
              <div class="mkz-c__mute mkz-c-js-mute">
                {muteIcon}
              </div>
              <div class="mkz-c__unmute mkz-c-js-unmute">
                {unmuteIcon}
              </div>
            </div>
            <div class="mkz-c__head-action">
              <div class="mkz-c__close mkz-c-js-close">
                {closeIcon}
              </div>
            </div>
          </div>

          <div class="mkz-c__head-row">
            <div class="mkz-c__head-state">
              <div class="mkz-c__state-wrap">
                <img class="mkz-c__m-assign-avatar mkz-c-js-agent-avatar" alt="" />
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mkz-c__m-assign-avatar-default mkz-c__avatar-default mkz-c-js-agent-avatar-default">
                  <path d="M0 8C0 6.76133 0 6.14198 0.0820778 5.62378C0.533889 2.77116 2.77116 0.533889 5.62378 0.0820778C6.14198 0 6.76133 0 8 0C9.23867 0 9.85802 0 10.3762 0.0820778C13.2288 0.533889 15.4661 2.77116 15.9179 5.62378C16 6.14198 16 6.76133 16 8V16H8C6.76133 16 6.14198 16 5.62378 15.9179C2.77116 15.4661 0.533889 13.2288 0.0820778 10.3762C0 9.85802 0 9.23867 0 8Z" fill="currentColor"/>
                  <rect x="8" y="4.22223" width="5.33333" height="5.33333" transform="rotate(45 8 4.22223)" class="mkz-c__avatar-default-inner" />
                </svg>
                <div class="mkz-c__state"></div>
              </div>
            </div>
            <div class="mkz-c__head-m">
              <div class="mkz-c__m-assign-text mkz-c__overflow mkz-c-js-agent-name"></div>
              <div class="mkz-c__m-assign-post mkz-c__overflow mkz-c-js-agent-post"></div>
            </div>
          </div>

        </div>

        <div class="mkz-c__content">
          <div class="mkz-c__scroll mkz-c-js-scroll">
            <div class="mkz-c__list mkz-c-js-history"></div>
            {copy()}
          </div>
        </div>

        {docs()}

        <label class="mkz-c__footer">
          <div class="mkz-c__footer-msg">
            <textarea class="mkz-c__input mkz-c-js-input" rows="1" placeholder="{appearance.placeholder || t('placeholder')}"></textarea>
          </div>
          <div class="mkz-c__footer-actions">
            <label class="mkz-c__footer-btn mkz-c-attach-js">
              {previewMode ? attachIcon : ''}
            </label>
            <div class="mkz-c__footer-btn mkz-c__footer-btn_type_submit mkz-c-js-submit">
              {sendIcon}
            </div>
          </div>
        </label>

      </div>
    </div>
  </div>

  <style type="text/css">
    {css}
[mkz] .mkz-c__head {
  border-color: {appearance.title_border};
}

[mkz] .mkz-c__content {
  background-color: {appearance.list_bg};
}
[mkz] .mkz-f__btn, [mkz] .mkz-c-o__btn, [mkz] .mkz-f__btn:hover, [mkz] .mkz-c-o__btn:hover {
  background-color: {appearance.btn_bg};
  color: {appearance.btn_color};
}
[mkz] .mkz-c__avatar-default {
  color: {appearance.bar_bg};
}
[mkz] .mkz-c__avatar-default-inner {
  fill: {appearance.bar_color};
}

[mkz] .mkz-c__footer {
  color: {appearance.form_color};
  background-color: {appearance.form_bg};
  border-color: {appearance.form_border};
}
[mkz] .mkz-c__footer-btn {
  color: {appearance.form_action_color};
}
  </style>

</div>