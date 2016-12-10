import React, { Component } from 'react'
import ImageGallery from 'react-image-gallery'
import './Gallery.css'

class Gallery extends Component {
  state = {
    images: [],
    page: 1,
    currentIndex: 0,
    isFinishLoading: false,
  }

  constructor(props) {
    super(props)
    this.getImages = this.getImages.bind(this)
  }

  handleImageLoad(event) {
    console.log('Image loaded ', event.target)
  }

  async getImages() {
    if (this.state.currentIndex < this.state.images.length - 5 || !this._isMounted || this.state.isFinishLoading) return
    let list;
    const imageRegex = /https?:\/\/[a-zA-Z0-9\.\/\-_]+(jpg|png|gif)/g
    console.log('loading ' + this.state.page)
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ this.props.threadId }/page/${ this.state.page }`)
      list = await list.json()
      // Have to check mount state of this component since there are two async operations above
      if (!this._isMounted) return
      console.log(list)
      if (list.success) {
        const data = list.response.item_data
        const images = []
        data.forEach(c => {
          const commentImages = c.msg.match(imageRegex)
          if (commentImages && commentImages.length) {
            // TODO: use a set
            commentImages.forEach(image => {
              images.push({
                original: image,
                thumbnail: image,
              })
            })
          }
        })
        this.setState({
          images: this.state.images.concat(images),
          page: this.state.page + 1,
        })
        if (this.state.images.length < 5) {
          this.getImages(this.state.page)
        }
      } else {
        this.setState({ isFinishLoading: true })
        return;
      }
    } catch(e) {
      return;
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.getImages(1)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const loadMore = currentIndex => {
      this.setState({ currentIndex: currentIndex })
      this.getImages(this.state.page)
    }
    return (
      <div className="gallery">
        <ImageGallery
          items={this.state.images}
          infinite={ false }
          onImageLoad={this.handleImageLoad}
          showPlayButton={ false }
          showIndex={ false }
          lazyLoad={ true }
          showFullscreenButton={ false }
          onSlide={ loadMore }/>
      </div>
    );
  }
}

export default Gallery
