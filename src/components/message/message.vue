<template>
  <div class="th-message" :style="{marginTop:`-${topPadding}px`}">
    <scroller class="messagebox" ref="scrollerEvent" lock-x v-model="status" :height="bottomheight" :use-pulldown="usePulldown" @on-pulldown-loading="pulldown" @on-scroll="onscroll">
      <div ref="scrollbox" :style="{paddingTop:`${topPadding}px`}">
        <div class="message-item" :class="{'people-item':i.type===1,'doc-item':i.type===2,'msg-item':i.type===3,'default-item':i.type===4,'isimg':i.isimg}" v-for="i in messageData">
          <img class="headimg" :src="i.headImg||i.type===1?selfFace||people:otherFace||doc" @click.stop="faceclick(i)">
          <div class="mtext" v-html="i.text" @click.stop="msgclick(i)"></div>
        </div>
        <x-button v-if="bigBtn!==''" class="pbtn" type="primary" @click.native="btnCall">{{bigBtn}}</x-button>
      </div>
      <div v-if="usePulldown" slot="pulldown" class="th-pulldown" style="position: absolute; top:100px;" :style="{top:`${parseInt(topPadding||0)-60}px`}">
        <span v-show="status.pulldownStatus === 'default'" v-html="`${pulldownConfig.default||'下拉刷新'}`"></span>
        <span v-show="status.pulldownStatus === 'down'" v-html="`${pulldownConfig.down||'下拉刷新'}`"></span>
        <span v-show="status.pulldownStatus === 'up'" v-html="`${pulldownConfig.up||'松开刷新'}`"></span>
        <span v-show="status.pulldownStatus === 'loading'" v-html="`${pulldownConfig.loading||'加载中...'}`"></span>
      </div>
    </scroller>
    <div class="message_button">
      <span class="message_button_p">您可能想问：</span>
      <span class="message_button_content" @click="addMessage('我想学习计算机专业')">我想学习计算机专业</span>
      <span class="message_button_content" @click="addMessage('我想学习建筑专业')">我想学习建筑专业</span>
      <span class="message_button_content" @click="addMessage('网络')">网络</span>
      <span class="message_button_content"><a href="http://www.zhongkeruitong.top/evaluate/evaluate/index.html" class="message_button_a">我要测评</a></span>
      <span class="message_button_content"><a href="http://zhiheyikaoqin.cn/show/cee/wechat/authorize?returnUrl=index.html" class="message_button_a">志愿预测</a></span>
    </div>
    <div ref="thMessageInput" class="inputbox" :class="{'textShow':textShow}" v-if="showInput!==false">
      <template v-if="useText">
        <i class="icon-add" :class="{isopen:funcShow}" @click="openfunc"></i>
        <i v-if="showEmoticon" class="icon-face" :class="{isopen:faceShow}" @click="openface"></i>
        <popover placement="top" class="input_popover" style="margin: 5px;position: absolute;" v-if="showTanKu" @on-show="onShow" @on-hide="onHide">
          <div slot="content" class="popover-demo-content" v-for="(item, index) in searchTips" :key="index" @click="tipClick(item)">
            {{item || '暂无'}}
          </div>
        </popover>
        <input ref="thMessageInputF" id="messageinput" class="messageinput" v-model="inputmodel" type="text" @focus="onfocus" @blur="onblur" @keyup.enter="changecount" oninput="changeText()"/>
        <x-button class="sendbtn" :type="inputmodel.trim()===''?'default':'primary'" :disabled="inputmodel.trim()===''" @click.native="changecount">
          发送
        </x-button>
<!--        <input ref="thMessageInputF" id="messageinput" class="messageinput" v-model="inputmodel" type="text" @focus="onfocus" @blur="onblur" @keyup.enter="changecount" oninput="changeText()"/>-->
<!--        <x-button class="sendbtn" :type="inputmodel.trim()===''?'default':'primary'" :disabled="inputmodel.trim()===''" @click.native="changecount">-->
<!--          发送-->
<!--        </x-button>-->
      </template>
    </div>
    <facebox v-show="faceShow" ref="facebox" :facelist="facelist" @itemClick="faceItemClick"></facebox>
    <funcbox v-show="funcShow" :funclist="funclist"></funcbox>
<!--    <textbox v-show="textShow" ref="textbox" @sendText="sendText" @textFocus="textFocus" @textBlur="textBlur"></textbox>-->
  </div>
</template>

<script>
import "@/assets/sass/components/message.scss";
import doc from "@/assets/images/doc.png";
import people from "@/assets/images/people.png";
import quick from "@/assets/images/quick.png";
import camera from "@/assets/images/camera.png";
import gallery from "@/assets/images/gallery.png";

import { Scroller, XButton, Popover } from "vux";
import { facelist } from "@/assets/testdata.js";
import {getSearchTip} from '@/api/index';

import facebox from "./facebox.vue";
import funcbox from "./funcbox.vue";

export default {
  name: "ThMessage",
  props: {
    useText: {
      type: Boolean,
      default: false
    },
    topPadding: {
      type: Number
    },
    messageData: {
      type: Array
    },
    funcList: {
      type: Array
    },
    bigBtn: {
      type: String,
      default: ""
    },
    showInput: {
      type: Boolean
    },
    selfFace: {
      type: String
    },
    otherFace: {
      type: String
    },
    usePulldown: {
      type: Boolean
    },
    pulldownConfig: {
      type: Object
    },
    showEmoticon: {
      type: Boolean,
      default: true
    },
    fromTop: {
      type: Boolean,
      default: false
    },
    textTitle: {
      type: String,
      default: '输入文字'
    }
  },
  components: {
    Scroller,
    XButton,
    facebox,
    funcbox,
    Popover
  },
  watch: {
    textfocus (e) {
      if (e) {
        this.canclose = false;
      }
    },
    messageData () {
      this.$nextTick(() => {
        if (
          this.status.pulldownStatus === "default" ||
          this.status.pulldownStatus === "down"
        ) {
          this.messageReset();
        } else {
          this.$refs.scrollerEvent.reset();
        }
      });
    },
    showInput (e) {
      if (!e) {
        this.defaultresize = 40;
        this.$nextTick(() => {
          this.hideBox();
        });
      }
    },
    funcList () {
      this.funclist = this.funclist.filter(e => {
        return this.funcList.indexOf(e.type) !== -1;
      });
    }
  },
  data () {
    return {
      flag: '',
      chuanzhi: '',
      searchTips: [], // 搜索提示
      showTanKu: false,
      bottomheight: "-120",
      defaultresize: 100,
      boxheight: "0px",
      scrollTop: 0,
      screamHeight: 0,
      count: 20,
      top: 0,
      inputmodel: "",
      doc: doc,
      people: people,
      faceShow: false,
      facelist: facelist,
      funcShow: false,
      isFocus: false,
      textShow: false,
      textfocus: false,
      canclose: true,
      status: {
        pulldownStatus: "default"
      },
      funclist: [
        {
          type: "gallery",
          text: "照片",
          img: gallery,
          click: () => {
            console.log("调用照片组件");
            this.$emit("galleryCall");
          }
        },
        {
          type: "camera",
          text: "拍摄",
          img: camera,
          click: () => {
            console.log("调用拍摄组件");
            this.$emit("cameraCall");
          }
        },
        {
          type: "quick",
          text: "快捷回复",
          img: quick,
          click: () => {
            console.log("调用快捷回复组件");
            this.$emit("quickCall");
          }
        }
      ]
    };
  },
  mounted () {
    this.changeText(this.inputmodel)
    if (this.showInput === false) {
      this.defaultresize = 40;
    }
    let h =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    this.screamHeight = h - 90;   //发完消息，能够完全显示，在可能想问链接上面
    this.funclist = this.funclist.filter(e => {
      return this.funcList.indexOf(e.type) !== -1;
    });
    window.onresize = () => {
      let h2 =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      this.screamHeight = h2 - 40;   //也不知道是啥，先减再说
      this.$refs.scrollerEvent.getStyles();
      this.messageReset();
    };
    this.$nextTick(() => {
      const imgs = document.querySelectorAll(".mtext>img");
      if (imgs.length === 0) {
        this.messageReset();
        if (this.fromTop)
          this.scrollToTop()
      } else {
        imgs.forEach(e => {
          e.addEventListener(
            "load",
            () => {
              this.messageReset()
              if (this.fromTop)
                this.scrollToTop()
            },
            false
          );
        });
      }
      setTimeout(() => {
        this.messageReset()
        if (this.fromTop)
          this.scrollToTop()
      }, 1000);
    });
  },
  methods: {
    addMessage(s_content) {
      this.$emit("sendOut", s_content);
    },
    scrollToTop () {
      this.$refs.scrollerEvent.reset({ top: 0 })
    },
    onfocus () {
      this.hideBox();
      const input = this.$refs.thMessageInput;
      setTimeout(() => {
        // input.UpdateLayout()
        const ua = navigator.userAgent,
          iOS11 = /OS 11_/.test(ua),
          micro = /MicroMessenger/.test(ua),
          safari = /Safari/.test(ua),
          wxwork = /wxwork/.test(ua);
        if (iOS11 && (micro || safari) && !wxwork) {
          return;
        }
        input.scrollIntoView();
        setTimeout(() => {
          input.scrollIntoView();
          this.isFocus = true;
        }, 300);
      }, 300);
    },
    onblur () {
      this.isFocus = false;
    },
    onscroll (p) {
      if (this.isFocus) {
        this.$refs.thMessageInputF.blur();
        this.hideBox();
      }
    },
    messageReset () {
      let mh =
        this.faceShow || this.funcShow || this.textShow
          ? 275
          : this.defaultresize;
      this.bottomheight = `-${mh + 65}`;
      if (this.$refs.scrollbox.clientHeight > this.screamHeight - mh) {
        this.$refs.scrollerEvent.reset({
          top: this.$refs.scrollbox.clientHeight - this.screamHeight + mh
        });
      }
    },
    changecount () {
      if (this.flag.length > 0) {
        if (this.inputmodel.trim() !== "") {
          let html = this.inputmodel + this.flag;
          this.$nextTick(() => {
            this.messageReset();
            this.inputmodel = "";
            this.flag = "";
            this.$emit("sendOut", html);
          });
        }
      } else {
        if (this.inputmodel.trim() !== "") {
          let html = this.inputmodel;
          this.$nextTick(() => {
            this.messageReset();
            this.inputmodel = "";
            this.$emit("sendOut", html);
          });
        }
      }
      console.log(this.inputmodel.trim())
      console.log('哈哈哈')
    },
    tipClick (val) {
      console.log('点击提示', val)
      this.flag = '{searchTip}'
      this.inputmodel = val
      // this.chuanzhi = val + this.flag
      this.showTanKu = false
    },
    changeText () {
      const that = this
      window.changeText = function() {
        var x = document.getElementById('messageinput')
        // x.value = x.value.toUpperCase(); // 只展示大写字母
        console.log('改变了么：', x.value)
        getSearchTip({
          query: x.value
        }).then(res => {
          that.searchTips = []
          // that.searchTips = res.data
          for (const item in res.data) {
            that.searchTips.push(res.data[item])
          }
          console.log(that.searchTips.length)
          console.log(that.showTanKu)
          if (that.searchTips.length > 0) {
            that.showTanKu = true
          } else if (that.searchTips.length === 0) {
            that.showTanKu = false
          }
          console.log('tips:', res.data)
        })
        console.log('aaaaaa', that.searchTips)
      }
    },
    faceclick (d) {
      this.$emit("faceClick", d);
    },
    msgclick (d) {
      this.$emit("msgClick", d);
    },
    btnCall () {
      this.$emit("bigBtnCall");
    },
    onShow () {
      console.log('on show')
    },
    onHide () {
      console.log('on hide')
    },
    openface () {
      this.funcShow = false;
      if (this.faceShow) {
        this.faceShow = false;
        this.messageReset();
      } else {
        this.faceShow = true;
        setTimeout(() => {
          this.messageReset();
          this.$nextTick(() => {
            this.$refs.facebox.$refs.faceScroll.reset({ top: 0 });
          });
        }, 300);
      }
    },
    faceItemClick (i) {
      this.inputmodel += `[${i}]`;
      if (this.useText) {
        this.changecount();
      }
    },
    openfunc () {
      this.faceShow = false;
      if (this.funcShow) {
        this.funcShow = false;
        this.messageReset();
      } else {
        this.funcShow = true;
        setTimeout(() => {
          this.messageReset();
        }, 300);
      }
    },
    // showText () {
    //   this.faceShow = false;
    //   this.funcShow = false;
    //   this.textShow = true;
    //   this.messageReset();
    // },
    // sendText (value) {
    //   this.inputmodel = value;
    //   this.changecount();
    // },
    hideBox () {
      this.funcShow = false;
      this.faceShow = false;
      this.textShow = false;
      this.messageReset();
    },
    pulldown () {
      this.$emit("pulldownCall");
    },
    resetpulldown () {
      this.status.pulldownStatus = "default";
    },
    // textFocus () {
    //   this.messageReset();
    //   this.textfocus = true;
    // },
    // textBlur () {
    //   this.textfocus = false;
    // }
  }
};
</script>
<style scoped lang="less">
  .message_button{
    /*position: absolute;*/
    padding-left: 20px;
    /*!*!*bottom: 60px;*!*!*/
    /*!*padding-top: 20px;*!*/
    /*padding-bottom: 20px;*/
    /*margin-bottom: 40px;*/
    background-color: #efefef ;
    height: 55px;
    /*line-height:135px;*/
  }
  .message_button_content{
    font-size: 14px;
    color: #4a93ec;
    margin-right: 10px;
  }
  .message_button_p{
    font-size: 14px;
  }
  .message_button_a{
    color: #4a93ec;
  }
  /*.messageinput {*/
  /*  margin-top: -5px;*/
  /*}*/
  .popover-demo-content {
    padding: 5px 10px;
  }
  .vux-popover {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    /* top: 83%; */
    bottom: 7%;
    width: 80%;
    background-color: #35495e;
    color: #fff;
    border-radius: 3px;
    z-index: 500;
  }
</style>
