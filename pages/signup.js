import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Message, Segment, TextArea, Divider, Image } from 'semantic-ui-react';

import CommonInputs from '../components/Common/CommonInputs';
import ImageDropDiv from '../components/Common/ImageDropDiv';
import { HeaderMessage, FooterMessage } from '../components/Common/WelcomeMessage';

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

function Signup() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        bio: '',
        facebook: '',
        youtube: '',
        twitter: '',
        instagram: '',
    });

    const { name, email, password, bio } = user;

    const [showSocialLinks, setShowSocialLinks] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(true);

    const [username, setUsername] = useState('');
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(false);

    const [ media, setMedia ] = useState(null);
    const [ mediaPreview, setMediaPreview] = useState(null);
    const [ highlighted, setHighlighted ] = useState(false);
    const inputRef = useRef();

    const handleSubmit = e => e.preventDefault();
    const handleChange = e => {
        const { name, value, files } = e.target;
        setUser( prev => ({ ...prev, [name]: value }) );
        if (name === 'media') {
            setMedia(files[0]);
            setMediaPreview( URL.createObjectURL(files[0]) );
        }
    };

    useEffect(() => {
        const isUser = Object.values({ name, email, password, bio }).every( item => Boolean(item) );
        isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
    }, [user]);

    return (
        <>
            <HeaderMessage />

            <Form loading={formLoading} error={errorMsg} onSubmit={handleSubmit}>
                <Message 
                    error 
                    header='Oops!' 
                    content={errorMsg} 
                    onDismiss={() => setErrorMsg(null)} 
                />
                <Segment>
                    <ImageDropDiv
                        mediaPreview={mediaPreview}
                        setMediaPreview={setMediaPreview}
                        setMedia={setMedia}
                        inputRef={inputRef}
                        highlighted={highlighted}
                        setHighlighted={setHighlighted}
                        handleChange={handleChange}
                    />
                    <Form.Input 
                        label='Name' 
                        placeholder='Name' 
                        name='name' 
                        value={name} 
                        onChange={handleChange} 
                        fluid 
                        icon='user' 
                        iconPosition='left'
                        required
                    />
                    <Form.Input 
                        label='Email' 
                        placeholder='Email' 
                        name='email' 
                        value={email} 
                        onChange={handleChange} 
                        fluid 
                        icon='envelope' 
                        iconPosition='left'
                        type='email'
                        required
                    />
                    <Form.Input 
                        label='Password' 
                        placeholder='Password' 
                        name='password' 
                        value={password} 
                        onChange={handleChange} 
                        fluid 
                        icon={{
                            name: 'eye',
                            circular: true,
                            link: true,
                            onClick: () => setShowPassword(!showPassword)
                        }} 
                        iconPosition='left'
                        type={ showPassword ? 'text' : 'password' }
                        required 
                    />
                    <Form.Input
                        loading={usernameLoading}
                        error={!usernameAvailable}
                        label='Username' 
                        placeholder='Username' 
                        name='username' 
                        value={username} 
                        onChange={e => {
                            setUsername(e.target.value);
                            if(regexUserName.test(e.target.value)) {
                                setUsernameAvailable(true);
                            } else {
                                setUsernameAvailable(false);
                            };
                        }} 
                        fluid 
                        icon={ usernameAvailable ? 'check' : 'close' } 
                        iconPosition='left'
                        required
                    />
                    <CommonInputs
                        user={user}
                        showSocialLinks={showSocialLinks}
                        setShowSocialLinks={setShowSocialLinks}
                        handleChange={handleChange}
                    />
                    <Divider hidden />
                    <Button
                        icon='signup'
                        content='Signup'
                        type='submit'
                        color='orange'
                        disabled={ submitDisabled || !usernameAvailable }
                    />
                </Segment>
            </Form>

            <FooterMessage />
        </>
    );
};

export default Signup;