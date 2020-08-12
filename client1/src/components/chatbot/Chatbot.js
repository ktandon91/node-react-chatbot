import React, {Component} from 'react';
import axios from 'axios/index';
import Message from './Message';
import Cookies from 'universal-cookie';
import {v4 as uuid} from 'uuid';
import Card from './Card';
import QuickReplies from './QuickReplies';
import {withRouter} from 'react-router-dom';

const cookies = new Cookies();

class Chatbot extends Component  {
    messagesEnd;

    constructor(props) {
        super(props);

        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
        this._handleQuickReplyPayload = this._handleQuickReplyPayload.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);

        this.state = {
            messages: [],
            showBot: true,
            isShopVisited: false

        }
        if (cookies.get('userID') === undefined) {
            cookies.set('userID', uuid(), {path: '/'});
        }
    }

    async df_text_query(text) {
        let says = {
            speaks: 'me',
            msg : {
                text : {
                    text: text
                }
            }
        }

        this.setState({messages:[...this.state.messages, says]});
        const res = await axios.post('/api/df_text_query', {text:text, userId:cookies.get('userID')});

        for (let msg of res.data[0].queryResult.fulfillmentMessages) {
            says = {
                speaks: 'bot',
                msg: msg
            }
            this.setState({messages : [...this.state.messages, says]});
        }

    }

    async df_event_query(eventName) {
        const res = await axios.post('/api/df_event_query', {event:eventName,
        userID: cookies.get('userID')});
        for (let msg of res.data[0].queryResult.fulfillmentMessages){
            let says = {
                speaks: 'bot',
                msg: msg
            }
            this.setState({messages:[...this.state.messages, says]})
        }
    }

    _handleQuickReplyPayload(event, payload, text){
        event.preventDefault();
        event.stopPropagation();
        switch(payload) {
            case 'training_masterclass':
                this.df_text_query('training_masterclass');
                break;
            case 'recommend_yes':
                this.df_event_query('SHOW_RECOMMENDATIONS');
                break;
            default:
                this.df_text_query(text);
                break;
        }
    }

    renderCards(cards) {
        return cards.map((card, i) => {
            return <Card key={i} payload={card.structValue}/>
        })
    }

     renderOneMessage(message, i) {
       
        if (("payload" in message.msg) && ("fields" in message.msg.payload) 
        && ("quick_replies" in message.msg.payload.fields)){
            return < QuickReplies
            text = {message.msg.payload.fields.text ? message.msg.payload.fields.text:null}
            key = {i}
            replyClick = {this._handleQuickReplyPayload}
            speaks = {message.speaks}
            payload = {message.msg.payload.fields.quick_replies.listValue.values}
            />;
        } 
        else if ("payload" in message.msg){
            return <div key={i}>
                <div className = 'card-panel grey lighten-5 z-depth-1'>
                     <div style={{overflow:"hidden"}}>
                         <div className = "col s2">
                           <div class="btn-floating btn-large waves-effect waves-light red">{message.speaks}</div>
                         </div>
                         <div style = {{overflow:"auto", overflowY: "scroll"}}>
                             <div style = {{height:300, widhth:message.msg.payload.fields.cards.listValue.values.length *270}}>
                             {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        }
        else if("text" in message.msg){
        return <Message key = {i} speaks={message.speaks} text={message.msg.text.text}/>;
        }
        else
            console.log(message);
            return null;
    }

    renderMessages(stateMessages){
        if (stateMessages) {
            return stateMessages.map((message,i)=>{
                return this.renderOneMessage(message, i);
            })
        }
        else {
            return null;
        }

    }

    resolveAfterXSeconds(x){
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(x)
            }, x*1000);
        })
    }

    async componentDidMount(){
        this.df_event_query("Welcome");
        if (window.location.pathname === '/shop' && !this.state.isShopVisited) {
            await this.resolveAfterXSeconds(2);
            this.df_event_query('WELCOME_SHOP');
            this.setState({isShopVisited:true})
        }

        this.props.history.listen(() => {
            if ( this.props.history.location.pathname === '/shop' && !this.state.isShopVisited){
                this.df_event_query('WELCOME_SHOP');
                this.setState({isShopVisited:true})
            }
        });
    }

    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({behaviour:"smooth"});
    }

    _handleInputKeyPress(e) {
        if (e.key === 'Enter') {
            this.df_text_query(e.target.value);
            e.target.value="";
        }
    }

   show(event) {
       event.preventDefault();
       event.stopPropagation();
       this.setState({showBot:true});
   }

   hide(event){
       event.preventDefault();
       event.stopPropagation();
       this.setState({showBot:false});
   }

    render () {
    
    if (this.state.showBot) {
    return (
        <div style={{minHeight:400, height:400, width:400, position:"absolute", bottom:0, right:10, border: '1px solid light grey'}}> 
            <nav>
                <div className="nav-wrapper">
                    <a href ="/" className = "brand-logo">Scooby</a>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li> <a href="/" onClick={this.hide}>Close</a></li>
                    </ul>
                </div>
            </nav>
            <div id="chatbot" style={{height:288, width:'100%', overflow:'auto'}}> 
                {this.renderMessages(this.state.messages)}
                <div ref = {(el) => this.messagesEnd = el}
                    style={{float:'left', clear:'both'}}>
                </div>
            </div>
            <div className="col s12">
                <input style={{margin:0, paddingLeft: '1%', paddingRight:'1%', width:'98%'}} placeholder="type a message" type="text" onKeyPress={this._handleInputKeyPress}/>
            </div>    
        </div>
         )
      }
      else {
        return (
        <div style={{minHeight:40, width:400, position:"absolute", bottom:0, right:10, border: '1px solid light grey'}}> 
            <nav>
                <div className="nav-wrapper">
                    <a href ="/" className = "brand-logo">Scooby</a>
                     <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li> <a href="/" onClick={this.show}>Show</a></li>
                    </ul>
                </div>
            </nav>
                <div ref = {(el) => this.messagesEnd = el}
                    style={{float:'left', clear:'both'}}>
                </div>
        </div>
         )
      }
    }
}
export default withRouter(Chatbot);