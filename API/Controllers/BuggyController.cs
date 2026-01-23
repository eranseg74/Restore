using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("not-found")]
        // If we are not returning anything we can use the IActionResult and not specify the returned type
        public IActionResult GetNotFound()
        {
            return NotFound();
        }

        [HttpGet("bad-request")]
        // If we are not returning anything we can use the IActionResult and not specify the returned type
        public IActionResult GetBadRequest()
        {
            return BadRequest("This is not a good request");
        }

        [HttpGet("unauthorized")]
        // If we are not returning anything we can use the IActionResult and not specify the returned type
        public IActionResult GetUnauthorized()
        {
            return Unauthorized();
        }

        [HttpGet("validation-error")]
        // If we are not returning anything we can use the IActionResult and not specify the returned type
        public IActionResult GetValidationError()
        {
            ModelState.AddModelError("Problem1", "This is the first error");
            ModelState.AddModelError("Problem2", "This is the second error");
            return ValidationProblem();
        }

        [HttpGet("server-error")]
        // If we are not returning anything we can use the IActionResult and not specify the returned type
        public IActionResult GetServerError()
        {
            throw new Exception("This is a server error");
        }
    }
}
