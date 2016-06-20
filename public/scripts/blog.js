var BlogBox = React.createClass({
    loadBlogPostsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleBlogPostSubmit: function(blogPost) {
        var blogPosts = this.state.data;
        console.log("blogPosts line 17",blogPosts)
        blogPost.id = Date.now();
        var newBlogPosts = blogPosts.concat([blogPost]);
        this.setState({data: newBlogPosts});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: blogPost,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({data: blogPosts});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function(){
        return {data: []};
    },
    componentDidMount: function() {
        this.loadBlogPostsFromServer();
        setInterval(this.loadBlogPostsFromServer, this.props.pollInterval);
    },
    render: function () {
        return (
            <div className="blogBox">
                <h1>Blog Posts</h1>
                <BlogPostList data={this.state.data}/>
                <BlogPostForm onBlogPostSubmit={this.handleBlogPostSubmit} />
            </div>
        );
    }
});
var BlogPostList = React.createClass({
    render: function(){
        var blogNodes = this.props.data.map(function(blogPost) {
            return(
                <BlogPost title={blogPost.title} 
                          text={blogPost.text} 
                          author={blogPost.author} 
                          key={blogPost.id}>
                    
                </BlogPost>
            );
        });
        return (
            <div className="blogPostList">
                {blogNodes}
            </div>
        );
    }
});
var BlogPostForm = React.createClass({
    getInitialState: function (){
        return {title: '', author: '', text: ''}
    },
     handleTitleChange: function(e) {
         //debugger;
        this.setState({title: e.target.value});
    },
    handleAuthorChange: function(e) {
        this.setState({author: e.target.value});
    }, 
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e){
        console.log('handle submit happend')
        e.preventDefault();
        var title = this.state.title.trim();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        console.log("title", title)
        if(!text || !author || !title) {
            return;
        }
        this.props.onBlogPostSubmit({title: title, author: author, text: text});
        this.setState({title: '', author: '', text: ''});
    },
    render: function(){
        return (
            <form className="blogPostForm" onSubmit={this.handleSubmit}>
                <h1>Write a New Post</h1>
                <input 
                    type="text" 
                    placeholder="Blog Title"
                    value={this.state.title}
                    onChange={this.handleTitleChange} /> <br />
                <input 
                    type="text" 
                    placeholder="Author's Name"
                    value={this.state.author} 
                    onChange={this.handleAuthorChange} /> <br />
                <textarea 
                    placeholder="Write a post!"
                    value={this.state.text} 
                    onChange={this.handleTextChange} /> <br />
                <input type="submit" value="Post" />
            </form>
        );
    }
});
var BlogPost = React.createClass({
    blogText: function(){
        //console.log('line 59 this', this)
        var md = new Remarkable();
        var blogText = md.render(this.props.text.toString());
        return { __html: blogText };
    }, 
    render: function() {
        //console.log("line 65 this", this)

        return (
            <div className="blogPost">
                <h2 className="blogTitle"> 
                    {this.props.title}
                </h2>
                By: {this.props.author} 
                <span dangerouslySetInnerHTML = {this.blogText()} />
            </div>
        );
    }
});

ReactDOM.render(
    <BlogBox url="/api/blog-posts" pollInterval={2000} />,
    document.getElementById('content')
);