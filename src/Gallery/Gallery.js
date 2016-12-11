import React, { Component } from 'react'
import ImageGallery from 'react-image-gallery'
import { Loader, Grid, Image, Modal } from 'semantic-ui-react'
import './Gallery.css'

class Gallery extends Component {
  state = {
    images: [],
    page: 1,
    isFinishLoading: false,
    openLightBox: false,
    startIndex: 0,
  }

  constructor(props) {
    super(props)
    this.getImages = this.getImages.bind(this)
  }

  async getImages() {
    if (!this._isMounted || this.state.isFinishLoading) return
    let list;
    const imageRegex = /https?:\/\/[a-zA-Z0-9\.\/\-_]+(jpg|png|gif)/g
    const hollandRegex = /https?:\/\/holland.pk\/[a-zA-Z0-9]+/g
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ this.props.threadId }/page/${ this.state.page }`)
      list = await list.json()
      // Have to check mount state of this component since there are two async operations above
      if (!this._isMounted) return
      if (list.success) {
        const data = list.response.item_data
        const images = []
        data.forEach(c => {
          const commentImages = (c.msg.match(imageRegex) || []).concat(c.msg.match(hollandRegex) || [])
          if (commentImages.length) {
            commentImages.forEach(image => {
              const key = image.replace('http://', '').replace('https://', '')
              if (!this.imageSet.has(key)) {
                images.push({ original: image })
                this.imageSet.add(key)
              }
            })
          }
        })
        this.setState({
          images: this.state.images.concat(images),
          page: this.state.page + 1,
        })
        this.getImages(this.state.page)
      } else {
        this.setState({ isFinishLoading: true })
      }
    } catch(e) {
      return;
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.imageSet = new Set()
    this.getImages(this.state.page)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const loaderActive = this.state.images.length === 0
    const getLoadingText = () => {
      if (loaderActive) {
        if (!this.state.isFinishLoading) {
          return <Loader size='massive'>撈緊，等陣</Loader>
        } else {
          return <div className="noPictureText"><img alt="dead" src={'https://lihkg.com/assets/faces/normal/dead.gif'}/><br/><span>隊長, 我看不到屎</span></div>
        }
      }
      return null
    }
    const toggleLightBox = () => {
      this.setState({ openLightBox: !this.state.openLightBox })
      document.body.className = "dimmable dimmed scrolling"
    }
    const onImageClick = (index) => {
      this.setState({ startIndex: index })
      toggleLightBox()
    }
    return (
      <div className="gallery">
        { getLoadingText() }
        <Grid columns={ 4 }>
          {this.state.images.map((image, i) => {
            return (
              <Grid.Column key={ i }>
                <Image onClick={ () => onImageClick(i) } src={ image.original } />
              </Grid.Column>
            )
          })}
        </Grid>
        <Modal basic size="small" open={ this.state.openLightBox } onClose={ toggleLightBox }>
          <ImageGallery
            items={ this.state.images }
            infinite={ false }
            showPlayButton={ false }
            showIndex={ false }
            lazyLoad={ true }
            showFullscreenButton={ false }
            showThumbnails={ false }
            startIndex={ this.state.startIndex }/>
        </Modal>
      </div>
    );
  }
}

export default Gallery
