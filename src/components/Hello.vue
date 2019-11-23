<template>
  <div style="height: 100%;width: 100%;display:flex;flex-direction: column;">
    <div class="q_a_header">学涯问答</div>
    <th-message class="q_a_content" ref="messgebox" :useText="true" :usePulldown="true" :pulldownConfig="pulldownconfig" :messageData="messageData" :funcList="funclist" :bigBtn="bigbtn" :showInput="showinput" :selfFace="selfface" :otherFace="otherface" :showEmoticon="true" @sendOut="senRequest" @galleryCall="gallery" @cameraCall="camera" @quickCall="quick" @bigBtnCall="btncall" @faceClick="faceclick" @msgClick="msgclick" @pulldownCall="pulldowncall">
    </th-message>
<!--    <div v-model="addMessage">-->
<!--      <a>hahhah</a>-->
<!--    </div>-->
<!--    <th-dialog :isShow.sync="showdialog" :showFrom="dialogfrom" :closeOnClickshadow="true" @onHide="hidedialog">-->
<!--    </th-dialog>-->
    <div id="theTemplate" style="display: none;">
      <div class="dialog">
        <div class="title">您可能想问：</div>
        <div class="content"><div onclick="sendRequest('我想学习计算机专业')">我想学习计算机专业</div></div>
        <div class="content"><div onclick="sendRequest('我想学习建筑专业')">我想学习建筑专业</div></div>
        <div class="content"><div onclick="sendRequest('网络')">网络</div></div>
        <div><a href="http://www.zhongkeruitong.top/evaluate/evaluate/index.html" class="content">我要测评</a></div>
        <div><a href="http://zhiheyikaoqin.cn/show/cee/wechat/authorize?returnUrl=index.html" class="content">志愿预测</a></div>
      </div>
    </div>
  </div>
</template>

<script>
import ThMessage from "./message";
import ThDoctortitlebar from "./doctortitlebar";
import ThDialog from "./dialog";

import { messageData, facelist } from "@/assets/testdata.js";
import selfface from "@/assets/images/p1.jpg";
import otherface from "@/assets/images/timg.jpg";
import { getAsk, getDB3Ask } from '@/api/index'

export default {
  name: "",
  components: {
    ThMessage,
    ThDoctortitlebar,
    ThDialog
  },
  data () {
    return {
      addMessage: [],
      messageData: [
        // {
        //   type: 2,
        //   text: `<div class="dialog">
        //             <div class="title">您可能想问：</div>
        //             <div class="content" style="color: RGB(74,147,236); font-size: 13px;padding-left: 5px"><div onclick="sendRequest('我想学习计算机专业')">我想学习计算机专业</div></div>
        //             <div class="content"><div onclick="sendRequest('我想学习建筑专业')">我想学习建筑专业</div></div>
        //             <div class="content"><a href="http://www.zhongkeruitong.top/evaluate/evaluate/index.html" style='color: RGB(74,147,236);'>我要测评</a>
        //          </div>`
        // },
        // {
        //   type: 2,
        //   text: "您好，请问有什么可以帮您？"
        // }
      ],
      // showHeight: false,
      content_ret: '',
      flag: '',
      flag_1: '',
      jobList: [],
      jobList_first: '',
      content: '',
      list_major: [],
      return_data: [],
      ques_list: [],
      ques_lists: [],
      b: [],
      bigbtn: "",
      showinput: true,
      funclist: ["gallery", "camera", "quick"],
      count: 10,
      showdialog: false,
      dialogfrom: "bottom",
      selfface: selfface,
      otherface: otherface,
      facelist: facelist,
      pulldownconfig: {
        default: "<div>下拉刷新</div>",
        up: "<div style='color:red'>下拉刷新</div>",
        down: "<div style='color:blue'>松手刷新</div>",
        loading: "<span style='color:green'>加载中</span>"
      }
    };
  },
  mounted () {
    this.addMeseage()
    setTimeout(() => {
      this.$refs.messgebox.messageReset()
    }, 5000);
    this.initWindow()
    this.sendRequestJob()
    this.sendRequestJob_3()
    this.showOpen()
    this.showClose()
    this.showOpenDetails()
    this.showCloseDetails()
    this.showCloseTitle() // type=2/1对感兴趣的列表较多，下拉展示
    this.showOpenTitle()
  },
  methods: {
    initWindow() {
      const that = this
      window.sendRequest = function(h) {
        that.jobList = []
        that.return_data = []
        console.log('可以点击啊~~')
        that.messageData.push({
          type: 1,
          text: that.replaceImg(h)
        });
        getAsk ({
          askWords: that.replaceImg(h),
          openid: '123456'
        }).then(res => {
          that.content = res.data
          // console.log(typeof that.content)
          console.log(that.content.length)
          console.log(that.content)
          that.flag = that.content.split(':')[1].split('}')[0] // 获取类型（调用哪个接口）
          console.log('flag:', that.flag)
          if (that.flag === '3') {
            console.log('flag:', that.flag)
            // console.log('flagtype:', typeof that.flag)
            that.jobList = that.content.split('{')[0].split('相似问题推荐：') // 分开前面的解释和后面的问题
            that.ques_list = []
            that.ques_lists = that.jobList[1].split(';')
            for (const i in that.ques_lists) {
              console.log(that.ques_lists[i])
              if (that.ques_lists[i].length > 1) {
                // that.ques_list += that.ques_lists[i]
                that.ques_list += `<div style="font-size: 13px;color: #4a93ec;margin-left: 5px;" onclick="sendRequestJob_3('${that.ques_lists[i]}')">${that.ques_lists[i]}</div>`
              }
            }
            that.messageData.push({
              type: 2,
              text: that.jobList[0] + "<br>"+ '相似问题推荐：'+ "<br>"+ that.ques_list
            });
          }else if (that.flag === '2' || that.flag === '1') {
            that.jobList = that.content.split('[')[1].split(']')[0].split(',')
            that.return_data = []
            if (that.jobList.length > 0) {
                for (const item in that.jobList) {
                  that.return_data += `<div style="font-size: 13px;color: #4a93ec;margin-left: 5px;" onclick="sendRequestJob('${that.jobList[item]}')">${that.jobList[item]}</div>`
                  // that.return_data.push(`<div onclick="sendRequest('${that.jobList[item]}')">${that.jobList[item]}</div>`)
                }
                const a = `<div style="max-height: 120px;overflow: hidden;display: inline-block;">${that.return_data}</div><div onclick="showOpenTitle()" style="font-size: 13px;color: blueviolet;display: inline-block;">展开</div>`
                that.messageData.push({
                  type: 2,
                  text: '您可能对'+ "<br>"+ a + "<br>" +  '感兴趣'
                  // text: '您可能对'+ "<br>"+ this.return_data +  '感兴趣'
                });
                // that.messageData.push({
                //   type: 2,
                //   text: '您可能对'+ "<br>"+ that.return_data +  '感兴趣'
                // });
            }
          } else {
            const type_1 = this.content.split('{')[0]
            this.messageData.push({
              type: 2,
              text: type_1
            });
          }
        })
      }
    },
    sendRequestJob() {
      const that = this
      window.sendRequestJob = function(h) {
        console.log('擦混给后端的值：', h)
        console.log('擦混给后端的值：', that.replaceImg(h))
        that.messageData.push({
          type: 1,
          text: that.replaceImg(h)
        });
        getAsk ({
          askWords: that.replaceImg(h),
          openid: '123456'
        }).then(res => {
          that.content = res.data
          that.flag_1 = that.content.split(':')[1].split('}')[0] // 获取类型（调用哪个接口）
          // if (that.flag_1 === '1') // 获取类型（调用哪个接口）
          console.log('格式为：', that.content)
          that.jobList = that.content.split('{')[0].split('相似问题推荐：') // 分开前面的解释和后面的问题
//           that.jobList[0] = `<div onclick="showOpen()"><div style="font-size: 14px;max-height: 40px;margin-bottom: 15px;overflow: hidden" v-if="!${that.showHeight}">${that.jobList[0]}</div>
// <div style="font-size: 14px;margin-bottom: 15px;" v-if="${that.showHeight}" >${that.jobList[0]}</div></div>`
//           console.log('werwerwerwerw00000000', that.jobList[0])
          if (that.jobList[0].length > 0) {
            that.jobList_first = `<div style="font-size: 14px;max-height: 50px;overflow: hidden">${that.jobList[0]}</div><span onclick="showOpen()" style="font-size: 13px;color: blueviolet">展开</span>`
          }
          // if (that.showHeight === false) {
          //   that.jobList_first = `<div style="font-size: 14px;max-height: 50px;overflow: hidden">${that.jobList[0]}</div><span onclick="showOpen()" style="font-size: 13px;color: blueviolet">展开</span>`
          // } else {
          //   that.jobList_first = `<div style="font-size: 14px;" onclick="showOpen()">${that.jobList[0]}</div>`
          //   // that.jobList[0] = `<div style="font-size: 14px;margin-bottom: 15px;" v-if="${that.showHeight}" onclick="showOpen()">${that.jobList[0]}</div>`
          // }
          // console.log('werwerwerwerw11111111111', that.jobList_first)
//           that.jobList[0] = that.showHeight === false ? `<div style="font-size: 14px;max-height: 50px;overflow: hidden" v-if="!${that.showHeight}" onclick="showOpen()">${that.jobList[0]}</div>`:
// `<div style="font-size: 14px;margin-bottom: 15px;" v-if="${that.showHeight}" onclick="showOpen()">${that.jobList[0]}</div>`
          that.ques_list = []
          that.ques_lists = that.jobList[1].split(';')
          for (const i in that.ques_lists) {
            console.log(that.ques_lists[i])
            if (that.ques_lists[i].length > 1) {
              // that.ques_list += that.ques_lists[i]
              that.ques_list += `<div style="font-size: 13px;color: #4a93ec;margin-left: 5px;" onclick="sendRequestJob_3('${that.ques_lists[i]}')">${that.ques_lists[i]}</div>`
            }
          }
          that.messageData.push({
            type: 2,
            text: that.jobList_first + "<br>"+ '相似问题推荐：'+ "<br>"+ that.ques_list
          });
          // console.log('222222222ma', that.content)
          // that.messageData.push({
          //   type: 2,
          //   text: that.content
          // });
        })
      }
    },
    showOpen() {
      const _this = this
      window.showOpen = function() {
        _this.jobList_first = `<div style="font-size: 14px;">${_this.jobList[0]}</div><span onclick="showClose()" style="font-size: 13px;color: blueviolet">收起</span>`
        // console.log(_this.jobList_first)
        _this.messageData.pop()
        // console.log(_this.messageData)
        _this.messageData.push({
          type: 2,
          text: _this.jobList_first + "<br>"+ '相似问题推荐：'+ "<br>"+ _this.ques_list
        })
        // _this.jobList[0] = []
        // if (_this.showHeight === false) {
          // _this.jobList[0] = `<div style="font-size: 14px;max-height: 50px;overflow: hidden" >${_this.jobList[0]}</div>`
        // } else {
          // _this.jobList[0] = `<div style="font-size: 14px;">${_this.jobList[0]}</div>`
        // }
        // console.log('meL:', _this.jobList[0])
        // _this.messageData.push({
        //   type: 2,
        //   text: _this.jobList[0]
        // });
        // _this.
        // if (_this.showHeight === false) {
        //   _this.showHeight = true
        // }
      }
    },
    showClose() {
      const _this = this
      window.showClose = function() {
        _this.jobList_first = `<div style="font-size: 14px;max-height: 50px;overflow: hidden">${_this.jobList[0]}</div><span onclick="showOpen()" style="font-size: 13px;color: blueviolet">展开</span>`
        _this.messageData.pop()
        _this.messageData.push({
          type: 2,
          text: _this.jobList_first + "<br>"+ '相似问题推荐：'+ "<br>"+ _this.ques_list
        })
      }
    },
    showOpenDetails() {
      const _this = this
      window.showOpenDetails = function() {
        _this.content_ret = `<div style="font-size: 14px">${_this.content}</div><span onclick="showCloseDetails()" style="font-size: 13px;color: blueviolet">收起</span>`
        _this.messageData.pop()
        _this.messageData.push({
          type: 2,
          text: _this.content_ret
        })
      }
    },
    showCloseDetails() {
      const _this = this
      window.showCloseDetails = function() {
        _this.content_ret = `<div style="font-size: 14px;max-height: 50px;overflow: hidden" >${_this.content}</div><span onclick="showOpenDetails()" style="font-size: 13px;color: blueviolet">展开</span>`
        _this.messageData.pop()
        _this.messageData.push({
          type: 2,
          text: _this.content_ret
        })
      }
    },
    sendRequestJob_3() {
      const that = this
      window.sendRequestJob_3 = function(h) {
        // that.messageData.push({
        //   type: 1,
        //   text: that.replaceImg(h)
        // });
        getDB3Ask ({
          query: that.replaceImg(h),
          // openid: '123456'
        }).then(res => {
          that.content = res.data.answer
          that.content_ret = `<div style="font-size: 14px;max-height:50px;overflow: hidden">${that.content}</div><span onclick="showOpenDetails()" style="font-size: 13px;color: blueviolet">展开</span>`
          // console.log(that.content_ret.height)
          that.messageData.push({
            type: 2,
            text: that.content_ret
          });
        })
      }
    },
    // returnData(item) {
    //   const that = this
    //   console.log('shuju ', that.jobList)
    //   that.messageData.push({
    //     type: 1,
    //     text: that.replaceImg(item)
    //   });
    //   var temp = document.getElementById("return_data").innerHTML;
    //   this.messageData.push({
    //     type: 2,
    //     text:temp
    //   })
    // },
    addMeseage () {
      const temp = document.getElementById("theTemplate").innerHTML;
      // this.sendRequest()
      // console.log(temp)
      this.messageData.push({
        type: 2,
        // text: "<div class=\"dialog\">\n" +
        //   "        <div class=\"title\">您可能想问：</div>\n" +
        //   "        <div class=\"content\"><button type=\"button\">Click Me!</button><input type=\"button\"/><span>我想学习计算机专业</span></div>\n" +
        //   "        <div class=\"content\"><div  onclick=\"sendRequest()\">测评</div></div>\n" +
        //   "        <!--        <div class=\"bottom\"><input id=\"Button2\" type=\"button\" value=\"确定\" class=\"btn\"/>&nbsp;&nbsp;<input id=\"Button3\" type=\"button\" value=\"取消\" class=\"btn\"/></div>-->\n" +
        //   "      </div>"
        text: temp
      });
    },
    replaceImg (word) {
      if(word) {
        return word.replace(/\[[\u4E00-\u9FA5]{1,3}\]/gi, word => {
          console.log(word, 999)
          let newWord = word.replace(/\[|\]/gi, "");
          let index = this.facelist.indexOf(newWord);
          return `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${index}.gif" align="middle">`;
        });
      } else {
        return ''
      }
    },
    senRequest (h) {
      this.jobList = []
      this.return_data = []
      console.log('可以点击啊~~')
      this.messageData.push({
        type: 1,
        text: this.replaceImg(h)
      });
      getAsk ({
        askWords: this.replaceImg(h),
        openid: '123456'
      }).then(res => {
        this.content = res.data
        // console.log(typeof that.content)
        console.log(this.content.length)
        console.log('返回内容：', this.content)
        this.flag = this.content.split(':')[1].split('}')[0] // 获取类型（调用哪个接口）
        console.log('flag:', this.flag)
        if (this.flag === '3') {
          console.log('flag:', this.flag)
          // console.log('flagtype:', typeof that.flag)
          this.jobList = this.content.split('{')[0].split('相似问题推荐：') // 分开前面的解释和后面的问题
          this.ques_list = []
          this.ques_lists = this.jobList[1].split(';')
          // this.jobList[0] = `<div style="font-size: 14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${this.jobList[0]}</div>`
          for (const i in this.ques_lists) {
            console.log(this.ques_lists[i])
            if (this.ques_lists[i].length > 1) {
              // that.ques_list += that.ques_lists[i]
              this.ques_list += `<div style="font-size: 13px;color: #4a93ec;margin-left: 5px;" onclick="sendRequestJob_3('${this.ques_lists[i]}')">${this.ques_lists[i]}</div>`
            }
          }
          this.messageData.push({
            type: 2,
            text: this.jobList[0] + "<br>"+ '相似问题推荐：'+ "<br>"+ this.ques_list
          });
        }else if (this.flag === '2' || this.flag === '1') {
          this.jobList = this.content.split('[')[1].split(']')[0].split(',')
          this.return_data = []
          if (this.jobList.length > 0) {
            for (const item in this.jobList) {
              this.return_data += `<div style="font-size: 13px;color: #4a93ec;margin-left: 5px;" onclick="sendRequestJob('${this.jobList[item]}')">${this.jobList[item]}</div>`
              // that.return_data.push(`<div onclick="sendRequest('${that.jobList[item]}')">${that.jobList[item]}</div>`)
            }
            console.log('this.return', this.return_data)
            const a = `<div style="max-height: 120px;overflow: hidden;display: inline-block;">${this.return_data}</div><div onclick="showOpenTitle()" style="font-size: 13px;color: blueviolet;display: inline-block;">展开</div>`
            this.messageData.push({
              type: 2,
              text: '您可能对'+ "<br>"+ a + "<br>" +  '感兴趣'
              // text: '您可能对'+ "<br>"+ this.return_data +  '感兴趣'
            });
          }
        } else {
          const type_1 = this.content.split('{')[0]
          this.messageData.push({
            type: 2,
            text: type_1
            // text: '您可能对'+ "<br>"+ this.return_data +  '感兴趣'
          });

        }
      })
    },
    showOpenTitle() {
      const _this = this
      window.showOpenTitle = function() {
        const a = `<div style="font-size: 14px">${_this.return_data}</div><span onclick="showCloseTitle()" style="font-size: 13px;color: blueviolet">收起</span>`
        _this.messageData.pop()
        _this.messageData.push({
          type: 2,
          text: '您可能对'+ "<br>"+ a + "<br>" +  '感兴趣'
        })
      }
    },
    showCloseTitle() {
      const _this = this
      window.showCloseTitle = function() {
        const a = `<div style="max-height: 120px;overflow: hidden;display: inline-block;">${_this.return_data}</div><div onclick="showOpenTitle()" style="font-size: 13px;color: blueviolet;display: inline-block;">展开</div>`
        _this.messageData.pop()
        _this.messageData.push({
          type: 2,
          text: '您可能对'+ "<br>"+ a + "<br>" +  '感兴趣'
        })
      }
    },
    // senRequest (h) {
    //   console.log('可以点击啊~~')
    //   this.messageData.push({
    //     type: 1,
    //     text: this.replaceImg(h)
    //   });
    //   getAsk ({
    //     askWords: this.replaceImg(h),
    //     openid: '123456'
    //   }).then(res => {
    //     this.content = res.data
    //     console.log(typeof this.content)
    //     console.log(this.content.length)
    //     if (typeof this.content === "object") {
    //       this.list_major = []
    //       for (var item in this.content) {
    //         this.list_major.push(`<span onclick="sendRequest('${this.content[item]}')">${this.content[item]}</span><br>`)
    //       }
    //       this.messageData.push({
    //         type: 2,
    //         text: '您可能对'+ "<br>"+ this.list_major +  '感兴趣'
    //       });
    //     }
    //
    //     console.log(this.list_major)
    //     // for (var item in this.content) {
    //     //   console.log(this.content[item].submajorName)
    //     //   this.list_major.push(this.content[item].submajorName)
    //     // }
    //     // console.log(this.list_major)
    //     // console.log('444444', this.content)
    //     this.messageData.push({
    //       type: 2,
    //       text: this.replaceImg(this.content)
    //     });
    //     console.log(this.content)
    //   })
    //   // console.log(this.replaceImg(h))
    //   // console.log('11111111', h);
    // },
    gallery () {
      console.warn("调起了自定义组件");
      this.messageData.push({
        type: 3,
        text: "调起了自定义相册组件"
      });
    },
    camera () {
      // this.messageData.push({
      //   type: 3,
      //   text: "调起了自定义拍照组件"
      // });
      this.messageData.push({
        type: 1,
        text:
          '<img src="http://img4.imgtn.bdimg.com/it/u=3088474657,3195539965&fm=11&gp=0.jpg">',
        isimg: true
      });
    },
    btncall () {
      alert("前往评价了");
      this.doctorbar.btn = "已评价";
      this.doctorbar.btntype = "default";
    },
    // topbtncall () {
    //   this.messageData.push({
    //     type: 4,
    //     text: "您已完成咨询，请前往评价"
    //   });
    //   this.bigbtn = "前往评价";
    //   this.showinput = false;
    //   this.doctorbar.btncanlick = false;
    // },
    quick () {
      this.showdialog = true;
    },
    hidedialog () {
      this.showdialog = false;
    },
    faceclick (d) {
      console.log(d);
    },
    msgclick (d) {
      if (d.isimg) alert(d.text);
    },
    headclick () {
      console.log("点击了头像");
    },
    pulldowncall () {
      console.log("pulldown");
      this.messageData.unshift({
        type: 1,
        text: "新增"
      });
      setTimeout(() => {
        this.$refs.messgebox.resetpulldown();
      }, 2000);
    }
  }
};
</script>
<style scoped>
  .q_a_header{
    height: 50px;
    text-align: center;
    line-height: 50px;
    background-color: #4a93ec;
  }
  .q_a_content{
    /*margin-top: 10px;*/
    /*height: 500px;*/
  }
  /*.title{*/
  /*  !*font-size: 13px;*!*/
  /*  color: #4a93ec;*/
  /*}*/
  .content{
    font-size: 13px;
    color: #4a93ec;
    margin-left: 5px;
  }
</style>
